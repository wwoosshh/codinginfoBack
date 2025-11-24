import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createConversation,
  getAllConversations,
  getConversationById,
  sendMessage,
  generateArticle,
  refineArticle,
  publishArticle,
  deleteConversation,
} from '../controllers/aiConversationController';

const router = express.Router();

/**
 * @route   POST /api/admin/ai-conversations
 * @desc    새 AI 대화 세션 생성
 * @access  Private (Admin)
 */
router.post('/', authenticate, createConversation);

/**
 * @route   GET /api/admin/ai-conversations
 * @desc    모든 대화 세션 조회
 * @access  Private (Admin)
 */
router.get('/', authenticate, getAllConversations);

/**
 * @route   GET /api/admin/ai-conversations/:id
 * @desc    특정 대화 세션 조회
 * @access  Private (Admin)
 */
router.get('/:id', authenticate, getConversationById);

/**
 * @route   POST /api/admin/ai-conversations/:id/messages
 * @desc    AI에게 메시지 전송
 * @access  Private (Admin)
 */
router.post('/:id/messages', authenticate, sendMessage);

/**
 * @route   POST /api/admin/ai-conversations/:id/generate-article
 * @desc    대화 기반 기사 생성
 * @access  Private (Admin)
 */
router.post('/:id/generate-article', authenticate, generateArticle);

/**
 * @route   POST /api/admin/ai-conversations/:id/refine-article
 * @desc    기사 수정 요청
 * @access  Private (Admin)
 */
router.post('/:id/refine-article', authenticate, refineArticle);

/**
 * @route   POST /api/admin/ai-conversations/:id/publish
 * @desc    기사 최종 발행
 * @access  Private (Admin)
 */
router.post('/:id/publish', authenticate, publishArticle);

/**
 * @route   DELETE /api/admin/ai-conversations/:id
 * @desc    대화 세션 삭제
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, deleteConversation);

export default router;
