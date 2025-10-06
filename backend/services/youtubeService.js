import ytDlpExec from 'yt-dlp-exec';
import { PassThrough } from 'stream';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_DURATION = parseInt(process.env.MAX_DURATION_SECONDS) || 3600;
const MAX_FILESIZE = parseInt(process.env.MAX_FILESIZE_BYTES) || 524288000;

/**
 * Get video information from YouTube
 */
const getInfo = async (url) => {
    try {
        const info = await ytDlpExec(url, {
            dumpSingleJson: true,
            noWarnings: true,
            noCallHome: true,
            noCheckCertificate: true,
            preferFreeFormats: true,
            youtubeSkipDashManifest: false,
        });

        if (info.duration && info.duration > MAX_DURATION) {
            throw new Error(`Video duration exceeds maximum allowed (${MAX_DURATION} seconds)`);
        }

        const formats = [];
        const seenResolutions = new Set();
        const audioTracks = [];

        if (info.audio_tracks && Array.isArray(info.audio_tracks)) {
            for (const track of info.audio_tracks) {
                audioTracks.push({
                    id: track.id,
                    lang: track.language,
                    label: track.language_name || track.language,
                    url: track.url || null
                });
            }
        }

        if (info.formats) {
            for (const fmt of info.formats) {
                if (fmt.vcodec !== 'none' && fmt.height) {
                    const resolution = `${fmt.height}p`;
                    if (!seenResolutions.has(resolution)) {
                        seenResolutions.add(resolution);
                        formats.push({
                            itag: fmt.format_id,
                            resolution: resolution,
                            ext: fmt.ext,
                            filesize: fmt.filesize || null,
                            hasAudio: fmt.acodec !== 'none',
                            fps: fmt.fps || null,
                            vcodec: fmt.vcodec
                        });
                    }
                }

                if (fmt.acodec !== 'none' && fmt.vcodec === 'none') {
                    audioTracks.push({
                        id: fmt.format_id,
                        label: `Audio ${fmt.abr || fmt.asr || 'unknown'}kbps`,
                        bitrate: fmt.abr || fmt.asr || null,
                        ext: fmt.ext
                    });
                }
            }
        }

        formats.sort((a, b) => {
            const aRes = parseInt(a.resolution);
            const bRes = parseInt(b.resolution);
            return bRes - aRes;
        });

        const uniqueAudioTracks = audioTracks.filter((track, index, self) =>
            index === self.findIndex((t) => t.bitrate === track.bitrate)
        ).slice(0, 3);

        const captions = [];
        if (info.subtitles || info.automatic_captions) {
            const allSubs = info.subtitles || {};
            for (const [lang, subFormats] of Object.entries(allSubs)) {
                if (subFormats && subFormats.length > 0) {
                    captions.push({
                        lang: lang,
                        name: subFormats[0].name || lang,
                        url: subFormats[0].url || null
                    });
                }
            }
        }

        const downloadEndpoints = [];

        formats.forEach(fmt => {
            downloadEndpoints.push({
                label: `${fmt.resolution} (MP4 - ${fmt.vcodec})`,
                formatQuery: fmt.resolution
            });
        });

        if (uniqueAudioTracks.length > 0) {
            downloadEndpoints.push({
                label: 'Audio Only (MP3)',
                formatQuery: 'audio'
            });
        }

        return {
            platform: 'youtube',
            title: info.title || 'Unknown Title',
            thumbnail: info.thumbnail || null,
            duration: info.duration || null,
            formats: formats,
            audioTracks: uniqueAudioTracks,
            captions: captions,
            downloadEndpoints: downloadEndpoints
        };

    } catch (error) {
        console.error('YouTube getInfo error:', error);
        throw new Error(`Failed to fetch YouTube video info: ${error.message}`);
    }
};

/**
 * Download video from YouTube and return stream
 */
const download = async (url, format = '720p', captionLang = null) => {
    try {
        const tempDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        const outputTemplate = path.join(tempDir, `video_${timestamp}_${randomId}.mp4`);

        let ytDlpOptions = {
            output: outputTemplate,
            // ✅ Force H.264 (avc1) codec for compatibility
            format: 'bestvideo[vcodec^=avc1][ext=mp4]+bestaudio[ext=m4a]/best[vcodec^=avc1][ext=mp4]/best',
            mergeOutputFormat: 'mp4',
            noWarnings: true,
            noCallHome: true,
            noCheckCertificate: true,
        };

        if (format === 'audio') {
            ytDlpOptions.format = 'bestaudio';
            ytDlpOptions.extractAudio = true;
            ytDlpOptions.audioFormat = 'mp3';
            ytDlpOptions.output = outputTemplate.replace('.mp4', '.mp3');
        } else if (format && format !== 'best') {
            const resolution = format.replace('p', '');
            ytDlpOptions.format = `bestvideo[height<=${resolution}][vcodec^=avc1][ext=mp4]+bestaudio[ext=m4a]/best[height<=${resolution}][vcodec^=avc1][ext=mp4]/best`;
        }

        if (captionLang) {
            ytDlpOptions.writeSubtitles = true;
            ytDlpOptions.subLang = captionLang;
            ytDlpOptions.convertSubs = 'srt';
        }

        await ytDlpExec(url, ytDlpOptions);

        let downloadedFile = outputTemplate;
        if (format === 'audio') {
            downloadedFile = outputTemplate.replace('.mp4', '.mp3');
        }

        if (!fs.existsSync(downloadedFile)) {
            const files = fs.readdirSync(tempDir).filter(f =>
                f.startsWith(`video_${timestamp}_${randomId}`)
            );
            if (files.length > 0) {
                downloadedFile = path.join(tempDir, files[0]);
            } else {
                throw new Error('Downloaded file not found');
            }
        }

        const stats = fs.statSync(downloadedFile);
        if (stats.size > MAX_FILESIZE) {
            fs.unlinkSync(downloadedFile);
            throw new Error(`File size exceeds maximum allowed (${MAX_FILESIZE} bytes)`);
        }

        const fileStream = fs.createReadStream(downloadedFile);

        fileStream.on('end', () => {
            setTimeout(() => {
                if (fs.existsSync(downloadedFile)) {
                    fs.unlinkSync(downloadedFile);
                    console.log(`🗑️  Cleaned up temp file: ${downloadedFile}`);
                }
            }, 1000);
        });

        fileStream.on('error', (error) => {
            console.error('File stream error:', error);
            if (fs.existsSync(downloadedFile)) {
                fs.unlinkSync(downloadedFile);
            }
        });

        const filename = format === 'audio'
            ? `youtube_audio_${timestamp}.mp3`
            : `youtube_video_${format}_${timestamp}.mp4`;

        return {
            stream: fileStream,
            filename: filename
        };

    } catch (error) {
        console.error('YouTube download error:', error);
        throw new Error(`Failed to download YouTube video: ${error.message}`);
    }
};

export default { getInfo, download };
