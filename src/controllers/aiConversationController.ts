import { Request, Response } from 'express';
import AIConversation, { ConversationStatus } from '../models/AIConversation';
import AIConfiguration from '../models/AIConfiguration';
import Article, { ArticleStatus } from '../models/Article';
import User from '../models/User';
import { AIProviderFactory } from '../services/ai/AIProviderFactory';
import { AIProviderType, AIMessage } from '../services/ai/AIProvider.interface';
import { decryptApiKey } from '../utils/encryption';

/**
 * 새 AI 대화 세션 생성
 */
export const createConversation = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { title, aiProvider } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!title || !aiProvider) {
      return res.status(400).json({ message: 'Title and AI provider are required' });
    }

    // AI Provider 유효성 검증
    if (!Object.values(AIProviderType).includes(aiProvider)) {
      return res.status(400).json({ message: 'Invalid AI provider' });
    }

    // 시스템 프롬프트 추가
    const systemMessage: AIMessage = {
      role: 'system',
      content: `당신은 코딩 관련 뉴스 및 사건사고를 다루는 전문 에디터입니다.
사용자와 대화하며 흥미로운 코딩 관련 주제에 대해 논의하고,
나중에 이 대화 내용을 바탕으로 독자들을 위한 기사를 작성할 것입니다.
대화할 때는 친근하고 전문적인 톤을 유지하며, 정확한 정보를 제공하세요.`,
    };

    const conversation = new AIConversation({
      title,
      aiProvider,
      author: userId,
      status: ConversationStatus.IN_PROGRESS,
      messages: [
        {
          role: systemMessage.role,
          content: systemMessage.content,
          timestamp: new Date(),
        },
      ],
    });

    await conversation.save();

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ message: 'Failed to create conversation' });
  }
};

/**
 * 모든 대화 세션 조회
 */
export const getAllConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { status } = req.query;

    const query: any = { author: userId };

    if (status) {
      query.status = status;
    }

    const conversations = await AIConversation.find(query)
      .sort({ createdAt: -1 })
      .select('title status aiProvider createdAt updatedAt publishedAt');

    res.json(conversations);
  } catch (error) {
    console.error('Get all conversations error:', error);
    res.status(500).json({ message: 'Failed to get conversations' });
  }
};

/**
 * 특정 대화 세션 조회
 */
export const getConversationById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const conversation = await AIConversation.findOne({
      _id: id,
      author: userId,
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Failed to get conversation' });
  }
};

/**
 * AI에게 메시지 전송
 */
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { message } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Message is required' });
    }

    const conversation = await AIConversation.findOne({
      _id: id,
      author: userId,
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // AI Provider 가져오기
    const config = await AIConfiguration.findOne({ userId });

    if (!config) {
      return res.status(400).json({ message: 'AI configuration not found. Please set up AI providers first.' });
    }

    const providerConfig = config.providers[conversation.aiProvider as keyof typeof config.providers];

    if (!providerConfig || !providerConfig.apiKey) {
      return res.status(400).json({ message: `${conversation.aiProvider} API key not configured` });
    }

    const apiKey = decryptApiKey(providerConfig.apiKey);
    const aiProvider = AIProviderFactory.createProvider(conversation.aiProvider, apiKey);

    // 사용자 메시지 추가
    const userMessage: AIMessage = {
      role: 'user',
      content: message,
    };

    conversation.messages.push({
      role: userMessage.role,
      content: userMessage.content,
      timestamp: new Date(),
    });

    // AI 응답 요청
    const conversationHistory: AIMessage[] = conversation.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    const aiResponse = await aiProvider.chat(conversationHistory);

    // AI 응답 추가
    conversation.messages.push({
      role: 'assistant',
      content: aiResponse.content,
      timestamp: new Date(),
    });

    await conversation.save();

    res.json({
      userMessage: conversation.messages[conversation.messages.length - 2],
      aiResponse: conversation.messages[conversation.messages.length - 1],
    });
  } catch (error: any) {
    console.error('Send message error:', error);
    res.status(500).json({ message: error.message || 'Failed to send message' });
  }
};

/**
 * 대화 기반 기사 생성
 */
export const generateArticle = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { customInstructions } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const conversation = await AIConversation.findOne({
      _id: id,
      author: userId,
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // AI Provider 가져오기
    const config = await AIConfiguration.findOne({ userId });

    if (!config) {
      return res.status(400).json({ message: 'AI configuration not found' });
    }

    const providerConfig = config.providers[conversation.aiProvider as keyof typeof config.providers];

    if (!providerConfig || !providerConfig.apiKey) {
      return res.status(400).json({ message: `${conversation.aiProvider} API key not configured` });
    }

    const apiKey = decryptApiKey(providerConfig.apiKey);
    const aiProvider = AIProviderFactory.createProvider(conversation.aiProvider, apiKey);

    // 기사 생성
    const conversationHistory: AIMessage[] = conversation.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    const article = await aiProvider.generateArticle(conversationHistory, customInstructions);

    // 기사 초안 저장
    conversation.draftArticle = {
      title: article.title,
      description: article.description,
      content: article.content,
      category: article.suggestedCategory || 'WEB_DEVELOPMENT',
      tags: article.tags,
    };

    conversation.status = ConversationStatus.COMPLETED;
    await conversation.save();

    res.json({
      message: 'Article generated successfully',
      draftArticle: conversation.draftArticle,
    });
  } catch (error: any) {
    console.error('Generate article error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate article' });
  }
};

/**
 * 기사 수정 요청
 */
export const refineArticle = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { feedback } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!feedback || feedback.trim() === '') {
      return res.status(400).json({ message: 'Feedback is required' });
    }

    const conversation = await AIConversation.findOne({
      _id: id,
      author: userId,
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.draftArticle) {
      return res.status(400).json({ message: 'No draft article found. Generate an article first.' });
    }

    // AI Provider 가져오기
    const config = await AIConfiguration.findOne({ userId });

    if (!config) {
      return res.status(400).json({ message: 'AI configuration not found' });
    }

    const providerConfig = config.providers[conversation.aiProvider as keyof typeof config.providers];

    if (!providerConfig || !providerConfig.apiKey) {
      return res.status(400).json({ message: `${conversation.aiProvider} API key not configured` });
    }

    const apiKey = decryptApiKey(providerConfig.apiKey);
    const aiProvider = AIProviderFactory.createProvider(conversation.aiProvider, apiKey);

    // 기사 수정
    const refinedArticle = await aiProvider.refineArticle(
      {
        title: conversation.draftArticle.title,
        description: conversation.draftArticle.description,
        content: conversation.draftArticle.content,
        tags: conversation.draftArticle.tags,
        suggestedCategory: conversation.draftArticle.category,
      },
      feedback
    );

    // 수정된 기사 저장
    conversation.draftArticle = {
      title: refinedArticle.title,
      description: refinedArticle.description,
      content: refinedArticle.content,
      category: refinedArticle.suggestedCategory || conversation.draftArticle.category,
      tags: refinedArticle.tags,
      imageUrl: conversation.draftArticle.imageUrl,
    };

    await conversation.save();

    res.json({
      message: 'Article refined successfully',
      draftArticle: conversation.draftArticle,
    });
  } catch (error: any) {
    console.error('Refine article error:', error);
    res.status(500).json({ message: error.message || 'Failed to refine article' });
  }
};

/**
 * 기사 발행
 * 일반 유저: draft 상태로 저장
 * 관리자: published 상태로 저장
 */
export const publishArticle = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const { id } = req.params;
    const { finalArticle } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const conversation = await AIConversation.findOne({
      _id: id,
      author: userId,
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.draftArticle && !finalArticle) {
      return res.status(400).json({ message: 'No article to publish' });
    }

    // 최종 기사 데이터
    const articleData = finalArticle || conversation.draftArticle;

    // slug 생성
    const slug = articleData.title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    // 유저 역할에 따라 status 결정
    // 관리자: published, 일반 유저: draft
    const articleStatus = userRole === 'admin'
      ? ArticleStatus.PUBLISHED
      : ArticleStatus.DRAFT;

    // Article 생성
    const article = new Article({
      title: articleData.title,
      description: articleData.description,
      content: articleData.content,
      category: articleData.category,
      slug: slug + '-' + Date.now(),
      status: articleStatus,
      author: userId,
      tags: articleData.tags || [],
      imageUrl: articleData.imageUrl,
    });

    await article.save();

    // Conversation 업데이트
    conversation.publishedArticleId = article._id as any;
    conversation.status = articleStatus === ArticleStatus.PUBLISHED
      ? ConversationStatus.PUBLISHED
      : ConversationStatus.COMPLETED;
    await conversation.save();

    const message = userRole === 'admin'
      ? 'Article published successfully'
      : 'Article submitted for review. An admin will review and publish it.';

    res.json({
      message,
      article,
      conversationId: conversation._id,
      status: articleStatus,
    });
  } catch (error: any) {
    console.error('Publish article error:', error);
    res.status(500).json({ message: error.message || 'Failed to publish article' });
  }
};

/**
 * 대화 세션 삭제
 */
export const deleteConversation = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const conversation = await AIConversation.findOneAndDelete({
      _id: id,
      author: userId,
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ message: 'Failed to delete conversation' });
  }
};
