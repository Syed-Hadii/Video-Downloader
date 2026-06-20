// controllers/downloadController.js
import { YtDlp } from "ytdlp-nodejs";
import { spawn } from "child_process";
import { sanitizeFilename } from "../utils/fileHelpers.js";
import { validateUrl } from "../utils/validators.js";

/**
 * Hybrid streaming controller with concurrency guard.
 * GET /api/download?url=<youtube_url>&format=<itag|best|720p|...>
 */

let activeDownloads = 0;
const MAX_CONCURRENT_DOWNLOADS = parseInt(process.env.MAX_CONCURRENT_DOWNLOADS) || 2;

const downloadController = async (req, res, next) => {
    try {
        const { url, format = "best" } = req.query;
        if (!url) return res.status(400).json({ error: "Missing required parameter: url" });
        const urlError = validateUrl(url);
        if (urlError) return res.status(400).json({ error: urlError });

        if (activeDownloads >= MAX_CONCURRENT_DOWNLOADS) {
            return res.status(429).json({ error: "Too many active downloads. Try again shortly." });
        }
        activeDownloads++;

        const filenameSafe = sanitizeFilename(`youtube_${format}`);
        res.setHeader("Content-Type", "video/mp4");
        res.setHeader("Content-Disposition", `attachment; filename="${filenameSafe}"`);

        const yt = new YtDlp();

        const finalize = () => {
            // small delay to avoid races
            setTimeout(() => {
                activeDownloads = Math.max(0, activeDownloads - 1);
            }, 50);
        };

        const isItag = /^\d+$/.test(String(format));

        // --------------- FAST PATH: direct itag / combined mp4 ---------------
        if (isItag) {
            try {
                // PipeResponse object from ytdlp-nodejs (has pipe / pipeAsync)
                const pr = yt.stream(url, { format: String(format) });

                // Start piping to the express response. Use pipe() to start immediately.
                // We won't await pipeAsync here so the response begins streaming quickly.
                pr.pipe(res);

                // Clean up if client aborts/close
                const cleanupOnAbort = () => {
                    try { if (typeof pr.destroy === "function") pr.destroy(); } catch (e) { }
                    finalize();
                };
                req.on("close", cleanupOnAbort);
                req.on("aborted", cleanupOnAbort);

                // When pipe finishes, finalize (some wrappers may provide pipeAsync; try to detect)
                // If pr.pipeAsync exists we can await it to be notified of completion.
                if (typeof pr.pipeAsync === "function") {
                    pr.pipeAsync(res)
                        .then(() => finalize())
                        .catch((err) => {
                            console.warn("Direct itag pipeAsync error (will fallback if needed):", err?.message || err);
                            // If pipeAsync failed early, ensure finalize and fallback behavior handled below
                            finalize();
                        });
                } else {
                    // If no pipeAsync, rely on request close/end and finalize there.
                    // Also attach a fallback finalize if response ends.
                    res.on("finish", finalize);
                    res.on("close", finalize);
                }

                // Return early: direct itag streaming started.
                return;
            } catch (err) {
                console.warn("Direct itag streaming attempt threw — falling back to merge pipeline:", err?.message || err);
                // ensure counter will be decremented by fallback path
            }
        }

        // --------------- FALLBACK: yt-dlp -> ffmpeg merge pipeline ---------------
        // Build merge format selector (restrict by height if format like '720p')
        const mergeFormat = (format && /p$/.test(String(format)))
            ? `bestvideo[height<=${String(format).replace("p", "")}][vcodec^=avc1][ext=mp4]+bestaudio[ext=m4a]/best[height<=${String(format).replace("p", "")}][vcodec^=avc1][ext=mp4]/best`
            : `bestvideo[vcodec^=avc1][ext=mp4]+bestaudio[ext=m4a]/best[vcodec^=avc1][ext=mp4]/best`;

        const ffmpeg = spawn("ffmpeg", [
            "-hide_banner", "-loglevel", "error",
            "-i", "pipe:0",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
            "-c:a", "aac", "-b:a", "192k",
            "-movflags", "frag_keyframe+empty_moov+faststart",
            "-f", "mp4", "pipe:1"
        ], { stdio: ["pipe", "pipe", "inherit"] });

        let mergingStream;
        try {
            mergingStream = yt.stream(url, { format: mergeFormat });
        } catch (err) {
            console.error("yt-dlp merging stream error:", err);
            finalize();
            try {
                if (!res.headersSent) res.status(500).json({ error: "Failed to fetch video stream" });
                else res.end();
            } catch (e) { }
            try { ffmpeg.kill("SIGKILL"); } catch (e) { }
            return;
        }

        // Use the wrapper's pipe() to pipe into ffmpeg.stdin.
        // If pipeAsync exists, start piping and don't await so ffmpeg gets data immediately.
        try {
            mergingStream.pipe(ffmpeg.stdin);
            // Alternatively start async piping and handle completion
            if (typeof mergingStream.pipeAsync === "function") {
                mergingStream.pipeAsync(ffmpeg.stdin).catch((err) => {
                    console.error("mergingStream.pipeAsync error:", err);
                    try { ffmpeg.kill("SIGKILL"); } catch (e) { }
                });
            }
        } catch (err) {
            console.error("Error piping mergingStream -> ffmpeg.stdin:", err);
            finalize();
            try { ffmpeg.kill("SIGKILL"); } catch (e) { }
            if (!res.headersSent) res.status(500).json({ error: "Failed merging stream" });
            return;
        }

        // Pipe ffmpeg stdout to response (ffmpeg is a regular ChildProcess with stdout as Node stream)
        ffmpeg.stdout.pipe(res);

        // Cleanup handlers
        const cleanup = () => {
            try { ffmpeg.kill("SIGKILL"); } catch (e) { }
            try { if (mergingStream && typeof mergingStream.destroy === "function") mergingStream.destroy(); } catch (e) { }
            finalize();
        };
        req.on("close", cleanup);
        req.on("aborted", cleanup);

        ffmpeg.on("close", (code) => {
            finalize();
            if (!res.writableEnded) {
                try { res.end(); } catch (e) { }
            }
        });

        ffmpeg.on("error", (err) => {
            console.error("ffmpeg error:", err);
            cleanup();
        });

    } catch (error) {
        console.error("Download controller unexpected error:", error);
        try { activeDownloads = Math.max(0, activeDownloads - 1); } catch (e) { }
        next(error);
    }
};

export default downloadController;
