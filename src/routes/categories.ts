import express from 'express';
import { getAllCategories } from '../controllers/categoryController';

const router = express.Router();

// 카테고리 API 응답 캐싱 (5분)
router.use((req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=300'); // 5분 캐싱
    res.set('ETag', `"categories-${Date.now()}"`);
  }
  next();
});

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management endpoints (Public access)
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all active categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of all active categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/', getAllCategories);

export default router;