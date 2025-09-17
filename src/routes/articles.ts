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

router.get('/', getAllArticles);
router.get('/search', searchArticles);
router.get('/category/:category', getArticlesByCategory);
router.get('/:slug', getArticleBySlug);

router.post('/', authenticate, authorize(['admin']), createArticle);
router.put('/:slug', authenticate, authorize(['admin']), updateArticle);
router.delete('/:slug', authenticate, authorize(['admin']), deleteArticle);

export default router;