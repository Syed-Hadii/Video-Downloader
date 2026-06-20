// services/api.js
import axios from "axios";
import { baseURL } from "./base-url";

export async function fetchInfo(url) {
    try {
        const resp = await axios.post(`${baseURL}/api/info`, { url });
        return resp.data;
    } catch (err) {
        const msg = err?.response?.data?.error || err.message || "Failed to fetch info";
        throw new Error(msg);
    }
}

/**
 * downloadVideo({ url, format, onProgress, filename })
 *
 * Initiates a browser-managed download by creating and clicking an <a> element.
 * This is more reliable than hidden iframes (less blocked by X-Frame-Options).
 * Because navigation-downloads don't expose byte-level progress to JS, we simulate progress for UI.
 */
export async function downloadVideo({ url, format, onProgress = null, filename = null }) {
    if (!url) throw new Error("Missing url");

    const params = new URLSearchParams();
    params.set("url", url);
    if (format) params.set("format", format);

    const downloadUrl = `${baseURL}/api/download?${params.toString()}`;

    return new Promise((resolve, reject) => {
        try {
            // Create anchor and try to click it
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.rel = "noopener";
            // cross-origin download attribute may be ignored, but set if available
            if (filename) a.download = filename;
            a.style.display = "none";
            document.body.appendChild(a);

            // Try a dispatchEvent click first (better for some browsers)
            let clicked = false;
            try {
                const ev = new MouseEvent("click", { bubbles: true, cancelable: true, view: window });
                clicked = a.dispatchEvent(ev);
            } catch (e) {
                // fallback to a.click()
                try { a.click(); clicked = true; } catch (e2) { clicked = false; }
            }

            // If click didn't work (popup blockers / weird browsers), open in new tab/window
            if (!clicked) {
                try {
                    const wnd = window.open(downloadUrl, "_blank", "noopener");
                    if (!wnd) {
                        // last resort: navigate current tab (user leaves site)
                        window.location.href = downloadUrl;
                    }
                } catch (e) {
                    window.location.href = downloadUrl;
                }
            }

            // Provide simulated progress UX for onProgress callback
            if (typeof onProgress === "function") {
                onProgress(3);
                const stages = [8, 18, 34, 56, 72, 88, 94];
                let idx = 0;
                const iv = setInterval(() => {
                    if (idx < stages.length) onProgress(stages[idx++]);
                }, 600);

                // finish after a timeout (streaming continues in browser downloads)
                const finishTimeout = setTimeout(() => {
                    clearInterval(iv);
                    onProgress(100);
                    try { a.remove(); } catch (e) { }
                    resolve();
                }, 9000); // tune as needed

                // cleanup on page unload
                const cleanup = () => {
                    clearInterval(iv);
                    clearTimeout(finishTimeout);
                    try { a.remove(); } catch (e) { }
                };
                window.addEventListener("beforeunload", cleanup, { once: true });
            } else {
                // no progress tracking requested
                setTimeout(() => { try { a.remove(); } catch (e) { } }, 2000);
                resolve();
            }
        } catch (err) {
            reject(err);
        }
    });
}
