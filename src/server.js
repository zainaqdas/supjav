const express = require('express');
const scraper = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ============================================================
// ROOT: API info
// ============================================================
app.get('/', (req, res) => {
  res.json({
    name: 'Javtiful Scraper API',
    version: '1.0.0',
    baseUrl: 'https://javtiful.com',
    endpoints: {
      main: '/api/main',
      trending: '/api/trending',
      categories: '/api/categories',
      category: '/api/category/:slug',
      actresses: '/api/actresses',
      actress: '/api/actress/:slug',
      channels: '/api/channels',
      channel: '/api/channel/:slug',
      search: '/api/search?q=query',
      video: '/api/video/:id',
      videoWithSlug: '/api/video/:id/:slug',
      videoStream: '/api/video/:id/stream',
      comments: '/api/video/:id/comments',
      downloadLink: '/api/video/:id/download-link',
      csrfToken: '/api/csrf-token',
    },
    queryParams: {
      page: 'Page number for paginated results (default: 1)',
      q: 'Search query (for /api/search)',
    },
  });
});

// ============================================================
// MAIN: Latest videos
// ============================================================
app.get('/api/main', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await scraper.getMain(page);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// TRENDING: Popular videos
// ============================================================
app.get('/api/trending', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await scraper.getTrending(page);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// CATEGORIES: List all categories
// ============================================================
app.get('/api/categories', async (req, res) => {
  try {
    const result = await scraper.getCategories();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// CATEGORY DETAIL: Videos in a category
// ============================================================
app.get('/api/category/:slug', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await scraper.getCategory(req.params.slug, page);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// ACTRESSES: List all actresses
// ============================================================
app.get('/api/actresses', async (req, res) => {
  try {
    const result = await scraper.getActresses();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// ACTRESS DETAIL: Videos by actress
// ============================================================
app.get('/api/actress/:slug', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await scraper.getActress(req.params.slug, page);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// CHANNELS: List all channels
// ============================================================
app.get('/api/channels', async (req, res) => {
  try {
    const result = await scraper.getChannels();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// CHANNEL DETAIL: Videos by channel
// ============================================================
app.get('/api/channel/:slug', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await scraper.getChannel(req.params.slug, page);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// SEARCH
// ============================================================
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    const page = parseInt(req.query.page) || 1;
    const result = await scraper.search(query, page);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// VIDEO DETAIL: Full video info with stream URLs
// ============================================================
app.get('/api/video/:id', async (req, res) => {
  try {
    const result = await scraper.getVideoDetail(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/video/:id/:slug', async (req, res) => {
  try {
    const result = await scraper.getVideoDetail(req.params.id, req.params.slug);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// VIDEO STREAM: Stream URLs only (lightweight)
// ============================================================
app.get('/api/video/:id/stream', async (req, res) => {
  try {
    const detail = await scraper.getVideoDetail(req.params.id);
    res.json({
      id: detail.id,
      title: detail.title,
      streams: detail.streams,
      qualityOptions: detail.qualityOptions,
      defaultQuality: detail.defaultQuality,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// COMMENTS: Get comments for a video
// ============================================================
app.get('/api/video/:id/comments', async (req, res) => {
  try {
    const result = await scraper.getComments(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// DOWNLOAD LINK: Attempt to get download link
// ============================================================
app.get('/api/video/:id/download-link', async (req, res) => {
  try {
    const csrfToken = req.headers['x-csrf-token'] || null;
    const result = await scraper.getDownloadLink(req.params.id, csrfToken);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// CSRF TOKEN
// ============================================================
app.get('/api/csrf-token', async (req, res) => {
  try {
    const result = await scraper.getCsrfToken();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`Javtiful Scraper API running on http://localhost:${PORT}`);
  console.log(`Visit http://localhost:${PORT}/ for API documentation`);
});

module.exports = app;
