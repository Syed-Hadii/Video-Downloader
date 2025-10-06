import axios from 'axios';
import { PassThrough } from 'stream';

/**
 * Get Instagram video info
 * Attempts to use scraping fallback since npm packages are unreliable
 */
const getInfo = async (url) => {
    try {
        // Instagram oEmbed endpoint (works for public posts)
        const oEmbedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}`;

        try {
            const response = await axios.get(oEmbedUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 10000
            });

            if (response.data) {
                return {
                    platform: 'instagram',
                    title: response.data.title || 'Instagram Video',
                    thumbnail: response.data.thumbnail_url || null,
                    downloadUrl: `/api/download?platform=instagram&url=${encodeURIComponent(url)}`
                };
            }
        } catch (oEmbedError) {
            console.log('oEmbed failed, trying alternate method');
        }

        // Fallback: Basic scraping approach
        // Note: This is simplified and may not work for all content
        const postResponse = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml',
            },
            timeout: 10000
        });

        // Try to extract video URL from page (simplified regex)
        const videoUrlMatch = postResponse.data.match(/"video_url":"([^"]+)"/);
        const thumbnailMatch = postResponse.data.match(/"display_url":"([^"]+)"/);

        return {
            platform: 'instagram',
            title: 'Instagram Video',
            thumbnail: thumbnailMatch ? thumbnailMatch[1].replace(/\\u0026/g, '&') : null,
            downloadUrl: `/api/download?platform=instagram&url=${encodeURIComponent(url)}`
        };

    } catch (error) {
        console.error('Instagram getInfo error:', error);
        throw new Error('Failed to fetch Instagram video info. The post may be private or unavailable.');
    }
};

/**
 * Download Instagram video
 */
const download = async (url) => {
    try {
        // Attempt to extract video URL using similar approach
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml',
            },
            timeout: 15000
        });

        // Extract video URL (this is simplified and may need updates)
        const videoUrlMatch = response.data.match(/"video_url":"([^"]+)"/);

        if (!videoUrlMatch) {
            throw new Error('Could not extract video URL from Instagram post');
        }

        let videoUrl = videoUrlMatch[1].replace(/\\u0026/g, '&').replace(/\\/g, '');

        // Stream the video
        const videoResponse = await axios.get(videoUrl, {
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            timeout: 30000
        });

        const timestamp = Date.now();
        const filename = `instagram_video_${timestamp}.mp4`;

        return {
            stream: videoResponse.data,
            filename: filename
        };

    } catch (error) {
        console.error('Instagram download error:', error);
        throw new Error('Failed to download Instagram video. The post may be private, a reel, or require authentication.');
    }
};

export default { getInfo, download };