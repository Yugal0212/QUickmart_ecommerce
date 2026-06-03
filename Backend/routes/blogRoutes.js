const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/Roalbase.auth.Middleware');

router.get('/', blogController.getBlogs);
router.get('/:slug', blogController.getBlogBySlug);
router.post('/', authMiddleware, roleMiddleware('admin'), blogController.createBlog);
router.put('/:id', authMiddleware, roleMiddleware('admin'), blogController.updateBlog);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), blogController.deleteBlog);

module.exports = router;
