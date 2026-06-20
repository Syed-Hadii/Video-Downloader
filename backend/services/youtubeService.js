// services/youtubeService.js
import ytDlpExec from "yt-dlp-exec";
import { getCache, setCache } from "./cache.js";

const MAX_DURATION = parseInt(process.env.MAX_DURATION_SECONDS) || 3600;
// cache TTL is in cache.setCache default (30m)

const extractVideoId = (url) => {
    // quick YouTube id extraction (works for common variants)
    try {
        const u = new URL(url);
        if (u.hostname.includes("youtu.be")) {
            return u.pathname.slice(1);
        }
        if (u.hostname.includes("youtube.com")) {
            return u.searchParams.get("v") || null;
        }
    } catch (e) { }
    return null;
};

const getInfo = async (url) => {
    try {
        const id = extractVideoId(url) || url;
        const cacheKey = `info:${id}`;
        const cached = getCache(cacheKey);
        if (cached) return cached;

        // Request JSON metadata (skip any downloading)
        const info = await ytDlpExec(url, {
            dumpSingleJson: true,
            noWarnings: true,
            noCallHome: true,
            noCheckCertificate: true,
            preferFreeFormats: true,
            skipDownload: true,
            // youtubeSkipDashManifest may help in some cases
            youtubeSkipDashManifest: true,
            // set socket timeout shorter to avoid hangs (seconds)
            socketTimeout: 10,
        });

        if (info.duration && info.duration > MAX_DURATION) {
            throw new Error(`Video duration exceeds maximum allowed (${MAX_DURATION} seconds)`);
        }

        // Build unique resolutions list, and also build a mapping resolution->best combined itag when possible
        const formats = [];
        const seen = new Set();
        const formatMap = {}; // resolution => itag (prefer combined mp4)
        let bestCombinedItag = null; // an itag that contains audio+video in mp4 (fast path)

        if (info.formats && Array.isArray(info.formats)) {
            // iterate formats and collect combined mp4 formats and single streams
            // We will choose the highest combined mp4 (video+audio) as bestCombinedItag
            for (const f of info.formats) {
                // skip DASH audio-only or video-only unless needed later
                const isVideo = f.vcodec && f.vcodec !== "none";
                const isAudio = f.acodec && f.acodec !== "none";
                const ext = f.ext || "";

                if (isVideo && f.height) {
                    const resolution = `${f.height}p`;
                    if (!seen.has(resolution)) {
                        seen.add(resolution);
                        formats.push({
                            itag: f.format_id,
                            resolution,
                            ext,
                            filesize: f.filesize || null,
                            fps: f.fps || null,
                            vcodec: f.vcodec,
                            acodec: f.acodec || null,
                            combined: isVideo && isAudio && ext === "mp4",
                        });
                        // if this format has both audio+video and is mp4, consider it for direct use
                        if (isVideo && isAudio && ext === "mp4") {
                            // pick best combined mp4: prefer higher resolution (we fill formats in arbitrary order)
                            if (!bestCombinedItag) bestCombinedItag = f.format_id;
                            else {
                                // compare heights
                                const prev = info.formats.find(x => String(x.format_id) === String(bestCombinedItag));
                                if (prev && f.height > prev.height) bestCombinedItag = f.format_id;
                            }
                        }
                    }
                    // keep a mapping resolution->itag (this will be the first itag found for that resolution)
                    if (!formatMap[resolution]) {
                        formatMap[resolution] = f.format_id;
                    }
                }
            }
        }

        // sort formats descending by resolution numeric
        formats.sort((a, b) => parseInt(b.resolution) - parseInt(a.resolution));

        // downloadEndpoints for UI
        const downloadEndpoints = formats.map((f) => ({
            label: `${f.resolution} (MP4)`,
            // send itag as formatQuery so frontend can call download with itag
            formatQuery: String(f.itag),
            resolution: f.resolution,
        }));
        // add best fallback as itag if available, otherwise string 'best'
        if (bestCombinedItag) {
            downloadEndpoints.unshift({ label: "Best (MP4)", formatQuery: String(bestCombinedItag), resolution: "best" });
        } else {
            downloadEndpoints.unshift({ label: "Best (Merged)", formatQuery: "best", resolution: "best" });
        }

        const out = {
            platform: "youtube",
            title: info.title || "Unknown Title",
            thumbnail: info.thumbnail || null,
            duration: info.duration || null,
            formats,
            format_map: formatMap,
            best_combined_itag: bestCombinedItag ? String(bestCombinedItag) : null,
            downloadEndpoints,
        };

        setCache(cacheKey, out);
        return out;
    } catch (err) {
        console.error("YouTube getInfo error:", err);
        throw new Error(`Failed to fetch YouTube video info: ${err.message}`);
    }
};

export default { getInfo };
