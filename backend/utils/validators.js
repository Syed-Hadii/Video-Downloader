/**
 * Validate URL for YouTube only
 */
export const validateUrl = (url) => {
    if (!url) return 'URL is required';
    try {
        const parsed = new URL(url);
        if (
            !parsed.hostname.includes('youtube.com') &&
            !parsed.hostname.includes('youtu.be')
        ) {
            return 'Invalid YouTube URL';
        }
    } catch (e) {
        return 'Invalid URL format';
    }
    return null;
};
