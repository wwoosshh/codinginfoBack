import mongoose, { Document, Schema } from 'mongoose';
import { AIProviderType } from '../services/ai/AIProvider.interface';

/**
 * 대화 상태
 */
export enum ConversationStatus {
  IN_PROGRESS = 'in_progress',  // 진행 중
  COMPLETED = 'completed',      // 기사 생성 완료
  PUBLISHED = 'published',      // 발행됨
  ARCHIVED = 'archived',        // 보관됨
}

/**
 * 대화 메시지
 */
export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

/**
 * 생성된 기사 초안
 */
export interface DraftArticle {
  title: string;
  description: string;
  content: string;  // Markdown 형식
  category: string;
  tags: string[];
  imageUrl?: string;
}

/**
 * AI 대화 문서 인터페이스
 */
export interface IAIConversation extends Document {
  title: string;  // 대화 세션 제목
  status: ConversationStatus;

  // 사용된 AI 제공자
  aiProvider: AIProviderType;

  // 대화 메시지 히스토리
  messages: ConversationMessage[];

  // 생성된 기사 초안
  draftArticle?: DraftArticle;

  // 최종 발행된 아티클 참조
  publishedArticleId?: mongoose.Types.ObjectId;

  // 메타데이터
  author: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

const ConversationMessageSchema = new Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const DraftArticleSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  tags: [{
    type: String,
  }],
  imageUrl: {
    type: String,
  },
}, { _id: false });

const AIConversationSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Conversation title is required'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    status: {
      type: String,
      enum: Object.values(ConversationStatus),
      default: ConversationStatus.IN_PROGRESS,
    },
    aiProvider: {
      type: String,
      enum: Object.values(AIProviderType),
      required: [true, 'AI provider is required'],
    },
    messages: {
      type: [ConversationMessageSchema],
      default: [],
    },
    draftArticle: {
      type: DraftArticleSchema,
    },
    publishedArticleId: {
      type: Schema.Types.ObjectId,
      ref: 'Article',
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// 인덱스
AIConversationSchema.index({ author: 1, createdAt: -1 });
AIConversationSchema.index({ status: 1 });
AIConversationSchema.index({ aiProvider: 1 });

// 발행 시 publishedAt 자동 설정
AIConversationSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === ConversationStatus.PUBLISHED && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export default mongoose.model<IAIConversation>('AIConversation', AIConversationSchema);
