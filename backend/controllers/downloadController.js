import { validateUrl, validatePlatform } from '../utils/validators.js';
import youtubeService from '../services/youtubeService.js';
import instagramService from '../services/instagramService.js';
import facebookService from '../services/facebookService.js';
import tiktokService from '../services/tiktokService.js';
import { sanitizeFilename } from '../utils/fileHelpers.js';

/**
 * GET /api/download
 * Query params: platform, url, format (optional), captionLang (optional)
 * Streams MP4 file to client with Content-Disposition header
 */
const downloadController = async (req, res, next) => {
    try {
        const { platform, url, format, captionLang } = req.query;

        // Validate inputs
        if (!url || !platform) {
            return res.status(400).json({
                error: 'Missing required parameters: url and platform'
            });
        }

        const validationError = validatePlatform(platform);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        const urlValidationError = validateUrl(url, platform);
        if (urlValidationError) {
            return res.status(400).json({ error: urlValidationError });
        }

        // Route to appropriate service
        let downloadStream;
        let filename;

        switch (platform.toLowerCase()) {
            case 'youtube':
                const ytResult = await youtubeService.download(url, format, captionLang);
                downloadStream = ytResult.stream;
                filename = ytResult.filename;
                break;
            case 'instagram':
                const igResult = await instagramService.download(url);
                downloadStream = igResult.stream;
                filename = igResult.filename;
                break;
            case 'facebook':
                const fbResult = await facebookService.download(url);
                downloadStream = fbResult.stream;
                filename = fbResult.filename;
                break;
            case 'tiktok':
                const ttResult = await tiktokService.download(url);
                downloadStream = ttResult.stream;
                filename = ttResult.filename;
                break;
            default:
                return res.status(400).json({ error: 'Unsupported platform' });
        }

        // Set headers for download
        const safeFilename = sanitizeFilename(filename);
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);

        // Pipe the stream to response
        downloadStream.pipe(res);

        // Handle stream errors
        downloadStream.on('error', (error) => {
            console.error('Stream error:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Error streaming video' });
            }
        });

    } catch (error) {
        console.error('Download controller error:', error);
        next(error);
    }
};

export default downloadController;