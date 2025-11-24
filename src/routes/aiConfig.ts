import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getAIConfig,
  updateAIConfig,
  testAIProvider,
  getEnabledProviders,
} from '../controllers/aiConfigController';

const router = express.Router();

/**
 * @route   GET /api/admin/ai-config
 * @desc    AI 설정 조회
 * @access  Private (Admin)
 */
router.get('/', authenticate, getAIConfig);

/**
 * @route   POST /api/admin/ai-config
 * @desc    AI 설정 업데이트
 * @access  Private (Admin)
 */
router.post('/', authenticate, updateAIConfig);

/**
 * @route   POST /api/admin/ai-config/test/:provider
 * @desc    특정 AI 제공자의 API 키 테스트
 * @access  Private (Admin)
 */
router.post('/test/:provider', authenticate, testAIProvider);

/**
 * @route   GET /api/admin/ai-config/enabled
 * @desc    활성화된 AI 제공자 목록 조회
 * @access  Private (Admin)
 */
router.get('/enabled', authenticate, getEnabledProviders);

export default router;
