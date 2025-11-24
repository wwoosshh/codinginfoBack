import mongoose, { Document, Schema } from 'mongoose';
import { AIProviderType } from '../services/ai/AIProvider.interface';

/**
 * AI 제공자별 설정
 */
export interface ProviderConfig {
  apiKey?: string;  // 암호화된 API 키
  enabled: boolean;
  lastTested?: Date;
  lastTestSuccess?: boolean;
}

/**
 * AI 설정 문서 인터페이스
 */
export interface IAIConfiguration extends Document {
  userId: mongoose.Types.ObjectId;  // 관리자 사용자 ID (전역 설정이므로 하나만 존재)

  // AI 제공자별 설정
  providers: {
    gemini?: ProviderConfig;
    openai?: ProviderConfig;
    claude?: ProviderConfig;
  };

  // 기본 AI 제공자
  defaultProvider: AIProviderType;

  createdAt: Date;
  updatedAt: Date;
}

const ProviderConfigSchema = new Schema({
  apiKey: {
    type: String,  // 암호화된 상태로 저장
  },
  enabled: {
    type: Boolean,
    default: false,
  },
  lastTested: {
    type: Date,
  },
  lastTestSuccess: {
    type: Boolean,
  },
}, { _id: false });

const AIConfigurationSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,  // 사용자당 하나의 설정만 존재
    },
    providers: {
      gemini: ProviderConfigSchema,
      openai: ProviderConfigSchema,
      claude: ProviderConfigSchema,
    },
    defaultProvider: {
      type: String,
      enum: Object.values(AIProviderType),
      default: AIProviderType.GEMINI,  // 기본값은 무료인 Gemini
    },
  },
  {
    timestamps: true,
  }
);

// 인덱스는 userId의 unique: true로 자동 생성됨

export default mongoose.model<IAIConfiguration>('AIConfiguration', AIConfigurationSchema);
