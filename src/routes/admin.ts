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
  getSystemHealth,
} from '../controllers/adminController';

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
router.patch('/articles/:id/status', updateArticleStatus);
router.delete('/articles/:id', deleteArticleAdmin);

router.get('/system/health', getSystemHealth);

export default router;