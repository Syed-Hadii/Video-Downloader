/**
 * Validate supported platform
 */
export const validatePlatform = (platform) => {
    const supportedPlatforms = ['youtube', 'instagram', 'facebook', 'tiktok'];

    if (!platform) return 'Platform is required';
    if (!supportedPlatforms.includes(platform.toLowerCase())) {
        return `Unsupported platform. Supported: ${supportedPlatforms.join(', ')}`;
    }
    return null;
};

/**
 * Validate URL based on platform
 */
export const validateUrl = (url, platform) => {
    if (!url) return 'URL is required';

    try {
        const parsed = new URL(url);

        switch (platform.toLowerCase()) {
            case 'youtube':
                if (
                    !parsed.hostname.includes('youtube.com') &&
                    !parsed.hostname.includes('youtu.be')
                ) {
                    return 'Invalid YouTube URL';
                }
                break;

            case 'instagram':
                if (!parsed.hostname.includes('instagram.com')) {
                    return 'Invalid Instagram URL';
                }
                break;

            case 'facebook':
                if (!parsed.hostname.includes('facebook.com')) {
                    return 'Invalid Facebook URL';
                }
                break;

            case 'tiktok':
                if (!parsed.hostname.includes('tiktok.com')) {
                    return 'Invalid TikTok URL';
                }
                break;

            default:
                return 'Unsupported platform';
        }
    } catch (e) {
        return 'Invalid URL format';
    }

    return null;
};
