import axios from 'axios';
import { baseURL } from './base-url';
/**
 * fetchInfo(url, platform)
 * Calls POST /api/info with {url, platform}
 */
export async function fetchInfo(url, platform) {
    try {
        const resp = await axios.post(`${baseURL}/api/info`, { url, platform });
        return resp.data;
    } catch (err) {
        const msg = err?.response?.data?.error || err.message || 'Failed to fetch info';
        throw new Error(msg);
    }
}

/**
 * downloadVideo(options)
 * options: { url, platform, format, captionLang, audioId, onProgress (pct 0-100), filename (optional) }
 * Downloads streamed response from /api/download and triggers browser save.
 */
export async function downloadVideo({ url, platform, format, captionLang, audioId = null, onProgress = null, filename = null }) {
    const params = new URLSearchParams();
    params.set('url', url);
    params.set('platform', platform);
    if (format) params.set('format', format);
    if (captionLang) params.set('captionLang', captionLang);
    if (audioId) params.set('audioId', audioId); // <-- new param passed to backend

    const downloadUrl = `${baseURL}/api/download?${params.toString()}`;

    // Use fetch so we can stream and report progress
    const res = await fetch(downloadUrl);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Download failed');
    }

    // Try to get filename from headers if not provided
    if (!filename) {
        const disposition = res.headers.get('Content-Disposition') || '';
        const match = disposition.match(/filename="?(.*?)"?($|;)/i);
        if (match && match[1]) filename = match[1];
        else {
            const ext = format === 'audio' ? '.mp3' : '.mp4';
            filename = `download_${Date.now()}${ext}`;
        }
    }

    // Content-Length header for progress
    const contentLength = res.headers.get('Content-Length');
    const total = contentLength ? parseInt(contentLength, 10) : null;

    if (!res.body) {
        // older browsers
        const blob = await res.blob();
        triggerDownload(blob, filename);
        if (onProgress) onProgress(100);
        return;
    }

    const reader = res.body.getReader();
    const chunks = [];
    let received = 0;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (total && onProgress) {
            onProgress(Math.round((received / total) * 100));
        } else if (onProgress) {
            onProgress(Math.min(99, Math.round((received / (1024 * 1024)) * 5))); // crude approx
        }
    }

    // assemble blob
    const blob = new Blob(chunks, { type: 'video/mp4' });
    triggerDownload(blob, filename);
    if (onProgress) onProgress(100);
}

function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000 * 30);
}
