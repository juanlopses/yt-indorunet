const express = require('express');
const { ytmp3, ytmp4, ytsearch } = require('ruhend-scraper');

const app = express();
const port = 3000;

app.use(express.json());

// Función para validar si es una URL de YouTube
const isYouTubeUrl = (text) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return youtubeRegex.test(text);
};

// Endpoint para descargar audio (YTMP3)
app.get('/api/ytmp3', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ error: 'URL de YouTube requerida' });
        }

        const data = await ytmp3(url);
        res.json({
            title: data.title,
            audio: data.audio,
            author: data.author,
            description: data.description,
            duration: data.duration,
            views: data.views,
            upload: data.upload,
            thumbnail: data.thumbnail
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al procesar la solicitud', message: error.message });
    }
});

// Endpoint para descargar video (YTMP4)
app.get('/api/ytmp4', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ error: 'URL de YouTube requerida' });
        }

        const data = await ytmp4(url);
        res.json({
            title: data.title,
            video: data.video,
            author: data.author,
            description: data.description,
            duration: data.duration,
            views: data.views,
            upload: data.upload,
            thumbnail: data.thumbnail
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al procesar la solicitud', message: error.message });
    }
});

// Endpoint para búsqueda en YouTube
app.get('/api/ytsearch', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ error: 'Consulta de búsqueda requerida' });
        }

        const { video, channel } = await ytsearch(query);
        const results = [...video, ...channel].map(item => {
            if (item.type === 'video') {
                return {
                    type: 'video',
                    title: item.title,
                    url: item.url,
                    duration: item.durationH,
                    publishedTime: item.publishedTime,
                    views: item.view
                };
            } else if (item.type === 'channel') {
                return {
                    type: 'channel',
                    channelName: item.channelName,
                    url: item.url,
                    subscribers: item.subscriberH,
                    videoCount: item.videoCount
                };
            }
        }).filter(item => item);

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Error al procesar la solicitud', message: error.message });
    }
});

// Endpoint /play para audio (MP3)
app.get('/api/play', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ error: 'Consulta o URL requerida' });
        }

        if (isYouTubeUrl(query)) {
            // Si es una URL de YouTube, usar ytmp3 directamente
            const data = await ytmp3(query);
            res.json({
                title: data.title,
                audio: data.audio,
                author: data.author,
                description: data.description,
                duration: data.duration,
                views: data.views,
                upload: data.upload,
                thumbnail: data.thumbnail
            });
        } else {
            // Si es texto, buscar con ytsearch y usar el primer video
            const { video } = await ytsearch(query);
            if (!video || video.length === 0) {
                return res.status(404).json({ error: 'No se encontraron videos' });
            }

            const firstVideoUrl = video[0].url;
            const data = await ytmp3(firstVideoUrl);
            res.json({
                title: data.title,
                audio: data.audio,
                author: data.author,
                description: data.description,
                duration: data.duration,
                views: data.views,
                upload: data.upload,
                thumbnail: data.thumbnail
            });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al procesar la solicitud', message: error.message });
    }
});

// Endpoint /play2 para video (MP4)
app.get('/api/play2', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ error: 'Consulta o URL requerida' });
        }

        if (isYouTubeUrl(query)) {
            // Si es una URL de YouTube, usar ytmp4 directamente
            const data = await ytmp4(query);
            res.json({
                title: data.title,
                video: data.video,
                author: data.author,
                description: data.description,
                duration: data.duration,
                views: data.views,
                upload: data.upload,
                thumbnail: data.thumbnail
            });
        } else {
            // Si es texto, buscar con ytsearch y usar el primer video
            const { video } = await ytsearch(query);
            if (!video || video.length === 0) {
                return res.status(404).json({ error: 'No se encontraron videos' });
            }

            const firstVideoUrl = video[0].url;
            const data = await ytmp4(firstVideoUrl);
            res.json({
                title: data.title,
                video: data.video,
                author: data.author,
                description: data.description,
                duration: data.duration,
                views: data.views,
                upload: data.upload,
                thumbnail: data.thumbnail
            });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al procesar la solicitud', message: error.message });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
