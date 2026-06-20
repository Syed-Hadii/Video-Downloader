// controllers/infoController.js
import { validateUrl } from "../utils/validators.js";
import youtubeService from "../services/youtubeService.js";

const infoController = async (req, res, next) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: "Missing required field: url" });

        const urlValidationError = validateUrl(url);
        if (urlValidationError) return res.status(400).json({ error: urlValidationError });

        const info = await youtubeService.getInfo(url);
        res.json(info);
    } catch (error) {
        console.error("Info controller error:", error);
        next(error);
    }
};

export default infoController;
