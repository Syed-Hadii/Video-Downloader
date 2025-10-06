import axios from 'axios';

/**
 * Get TikTok video info
 * Uses oEmbed API and scraping fallback
 */
const getInfo = async (url) => {
    try {
        // TikTok oEmbed endpoint
        const oEmbedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;

        try {
            const response = await axios.get(oEmbedUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 10000
            });

            if (response.data) {
                return {
                    platform: 'tiktok',
                    title: response.data.title || 'TikTok Video',
                    thumbnail: response.data.thumbnail_url || null,
                    downloadUrl: `/api/download?platform=tiktok&url=${encodeURIComponent(url)}`
                };
            }
        } catch (oEmbedError) {
            console.log('TikTok oEmbed failed, trying alternate method');
        }

        // Fallback: Try to get video info from page
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml',
            },
            timeout: 10000
        });

        return {
            platform: 'tiktok',
            title: 'TikTok Video',
            thumbnail: null,
            downloadUrl: `/api/download?platform=tiktok&url=${encodeURIComponent(url)}`
        };

    } catch (error) {
        console.error('TikTok getInfo error:', error);
        throw new Error('Failed to fetch TikTok video info. The video may be private or unavailable.');
    }
};

/**
 * Download TikTok video
 */
const download = async (url) => {
    try {
        // Method 1: Try to extract video URL from page HTML
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml',
            },
            timeout: 15000
        });

        // Extract video download URL (simplified regex, may need updates)
        let videoUrl = null;
        const videoUrlMatch = response.data.match(/"downloadAddr":"([^"]+)"/);

        if (videoUrlMatch) {
            videoUrl = videoUrlMatch[1].replace(/\\/g, '');
        } else {
            const altMatch = response.data.match(/"playAddr":"([^"]+)"/);
            if (altMatch) {
                videoUrl = altMatch[1].replace(/\\/g, '');
            }
        }

        if (!videoUrl) {
            throw new Error('Could not extract video URL from TikTok post');
        }

        // Stream the video
        const videoResponse = await axios.get(videoUrl, {
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://www.tiktok.com/',
            },
            timeout: 30000
        });

        const timestamp = Date.now();
        const filename = `tiktok_video_${timestamp}.mp4`;

        return {
            stream: videoResponse.data,
            filename: filename
        };

    } catch (error) {
        console.error('TikTok download error:', error);
        throw new Error('Failed to download TikTok video. The video may be private or require authentication.');
    }
};

export default { getInfo, download };
