import path from 'path';

/**
 * Sanitize a filename to avoid issues with special characters
 * - removes invalid chars
 * - trims length
 */
export const sanitizeFilename = (filename) => {
    if (!filename) return 'video.mp4';

    // Remove special characters not allowed in filenames
    let safeName = filename.replace(/[^a-z0-9_\-\.]/gi, '_');

    // Ensure file has .mp4 extension
    if (!safeName.toLowerCase().endsWith('.mp4')) {
        safeName += '.mp4';
    }

    // Limit filename length
    if (safeName.length > 150) {
        const ext = path.extname(safeName);
        safeName = safeName.slice(0, 150 - ext.length) + ext;
    }

    return safeName;
};
