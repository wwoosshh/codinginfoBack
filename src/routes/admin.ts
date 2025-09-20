import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllArticlesAdmin,
  updateArticleStatus,
  deleteArticleAdmin,
  createArticle,
  updateArticle,
  getArticleById,
  getSystemHealth,
  getDashboardAnalytics,
} from '../controllers/adminController';

import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
  getCategoryStats,
} from '../controllers/categoryController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management endpoints (Admin access required)
 */

router.use(authenticate);
router.use(authorize(['admin']));

router.get('/dashboard/stats', getDashboardStats);

router.get('/users', getAllUsers);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

router.get('/articles', getAllArticlesAdmin);
router.post('/articles', createArticle);
router.get('/articles/:id', getArticleById);
router.put('/articles/:id', updateArticle);
router.patch('/articles/:id/status', updateArticleStatus);
router.delete('/articles/:id', deleteArticleAdmin);

router.get('/categories', getAllCategories);
router.post('/categories', createCategory);
router.get('/categories/stats', getCategoryStats);
router.get('/categories/:id', getCategoryById);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

router.get('/system/health', getSystemHealth);

// 향상된 대시보드 통계
router.get('/dashboard/analytics', getDashboardAnalytics);

export default router;