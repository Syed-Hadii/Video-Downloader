import { validateUrl, validatePlatform } from '../utils/validators.js';
import youtubeService from '../services/youtubeService.js';
import instagramService from '../services/instagramService.js';
import facebookService from '../services/facebookService.js';
import tiktokService from '../services/tiktokService.js';

/**
 * POST /api/info
 * Body: { url: string, platform: string }
 * Returns video metadata and available download options
 */
const infoController = async (req, res, next) => {
    try {
        const { url, platform } = req.body;
console.log(url, platform)
        // Validate inputs
        if (!url || !platform) {
            return res.status(400).json({
                error: 'Missing required fields: url and platform'
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

        // Route to appropriate service based on platform
        let info;
        switch (platform.toLowerCase()) {
            case 'youtube':
                info = await youtubeService.getInfo(url);
                break;
            case 'instagram':
                info = await instagramService.getInfo(url);
                break;
            case 'facebook':
                info = await facebookService.getInfo(url);
                break;
            case 'tiktok':
                info = await tiktokService.getInfo(url);
                break;
            default:
                return res.status(400).json({
                    error: 'Unsupported platform'
                });
        }

        res.json(info);
    } catch (error) {
        console.error('Info controller error:', error);
        next(error);
    }
};

export default infoController;