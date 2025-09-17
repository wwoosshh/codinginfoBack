import express from 'express';
import {
  getAllArticles,
  getArticleBySlug,
  getArticlesByCategory,
  searchArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} from '../controllers/articleController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Articles
 *   description: Article management endpoints
 */

/**
 * @swagger
 * /api/articles:
 *   get:
 *     summary: Get all articles
 *     tags: [Articles]
 *     responses:
 *       200:
 *         description: List of all articles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Article'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/', getAllArticles);

/**
 * @swagger
 * /api/articles/search:
 *   get:
 *     summary: Search articles
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         required: true
 *         description: Search keyword
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Article'
 *       400:
 *         description: Keyword is required
 *       500:
 *         description: Internal server error
 */
router.get('/search', searchArticles);

/**
 * @swagger
 * /api/articles/category/{category}:
 *   get:
 *     summary: Get articles by category
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: category
 *         schema:
 *           type: string
 *           enum: [OVERFLOW, GAME_DEVELOPMENT, GRAPHICS, ALGORITHM, WEB_DEVELOPMENT, DATA_STRUCTURE]
 *         required: true
 *         description: Article category
 *     responses:
 *       200:
 *         description: Articles in the specified category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Article'
 *       400:
 *         description: Invalid category
 *       500:
 *         description: Internal server error
 */
router.get('/category/:category', getArticlesByCategory);

/**
 * @swagger
 * /api/articles/{slug}:
 *   get:
 *     summary: Get article by slug
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *         description: Article slug
 *     responses:
 *       200:
 *         description: Article details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       404:
 *         description: Article not found
 *       500:
 *         description: Internal server error
 */
router.get('/:slug', getArticleBySlug);

/**
 * @swagger
 * /api/articles:
 *   post:
 *     summary: Create new article (Admin only)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, content, category, slug]
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [OVERFLOW, GAME_DEVELOPMENT, GRAPHICS, ALGORITHM, WEB_DEVELOPMENT, DATA_STRUCTURE]
 *               slug:
 *                 type: string
 *                 maxLength: 100
 *               imageUrl:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Article created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       400:
 *         description: Validation error or slug already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate, authorize(['admin']), createArticle);

/**
 * @swagger
 * /api/articles/{slug}:
 *   put:
 *     summary: Update article (Admin only)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *         description: Article slug
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [OVERFLOW, GAME_DEVELOPMENT, GRAPHICS, ALGORITHM, WEB_DEVELOPMENT, DATA_STRUCTURE]
 *               imageUrl:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Article updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Article not found
 *       500:
 *         description: Internal server error
 */
router.put('/:slug', authenticate, authorize(['admin']), updateArticle);

/**
 * @swagger
 * /api/articles/{slug}:
 *   delete:
 *     summary: Delete article (Admin only)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *         description: Article slug
 *     responses:
 *       204:
 *         description: Article deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Article not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:slug', authenticate, authorize(['admin']), deleteArticle);

export default router;