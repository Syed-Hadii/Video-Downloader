import axios from 'axios';

/**
 * Get Facebook video info
 * Note: Facebook videos are difficult to scrape without API access
 */
const getInfo = async (url) => {
    try {
        // Facebook oEmbed endpoint
        const oEmbedUrl = `https://www.facebook.com/plugins/video/oembed.json/?url=${encodeURIComponent(url)}`;

        try {
            const response = await axios.get(oEmbedUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 10000
            });

            if (response.data) {
                return {
                    platform: 'facebook',
                    title: response.data.title || 'Facebook Video',
                    thumbnail: response.data.thumbnail_url || null,
                    downloadUrl: `/api/download?platform=facebook&url=${encodeURIComponent(url)}`
                };
            }
        } catch (oEmbedError) {
            console.log('Facebook oEmbed failed');
        }

        // Basic fallback
        return {
            platform: 'facebook',
            title: 'Facebook Video',
            thumbnail: null,
            downloadUrl: `/api/download?platform=facebook&url=${encodeURIComponent(url)}`
        };

    } catch (error) {
        console.error('Facebook getInfo error:', error);
        throw new Error('Failed to fetch Facebook video info. The video may be private or unavailable.');
    }
};

/**
 * Download Facebook video
 * Note: This is a simplified implementation. Facebook frequently changes their structure.
 */
const download = async (url) => {
    try {
        // Attempt to fetch page and extract video URL
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml',
            },
            timeout: 15000
        });

        // Try to extract HD or SD video URL
        let videoUrl = null;
        const hdMatch = response.data.match(/"playable_url":"([^"]+)"/);
        const sdMatch = response.data.match(/"playable_url_quality_hd":"([^"]+)"/);

        if (hdMatch) {
            videoUrl = hdMatch[1].replace(/\\/g, '');
        } else if (sdMatch) {
            videoUrl = sdMatch[1].replace(/\\/g, '');
        }

        if (!videoUrl) {
            throw new Error('Could not extract video URL from Facebook post');
        }

        // Stream the video
        const videoResponse = await axios.get(videoUrl, {
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            timeout: 30000
        });

        const timestamp = Date.now();
        const filename = `facebook_video_${timestamp}.mp4`;

        return {
            stream: videoResponse.data,
            filename: filename
        };

    } catch (error) {
        console.error('Facebook download error:', error);
        throw new Error('Failed to download Facebook video. The video may be private or require authentication.');
    }
};

export default { getInfo, download };