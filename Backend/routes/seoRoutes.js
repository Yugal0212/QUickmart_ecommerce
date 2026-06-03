const express = require('express');
const router = express.Router();
const seoController = require('../controllers/seoController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/Roalbase.auth.Middleware');

router.get('/settings', seoController.getSettings);
router.put('/settings', authMiddleware, roleMiddleware('admin'), seoController.updateSettings);

router.get('/sitemap.xml', seoController.getSitemap);
router.get('/robots.txt', seoController.getRobotsTxt);

router.get('/analyze', authMiddleware, roleMiddleware('admin'), seoController.analyzeSeo);

module.exports = router;
