/**
 * AI Provider 추상화 인터페이스
 * 여러 AI 제공자(Gemini, OpenAI, Claude)를 통합 관리
 */

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  tokensUsed?: number;
  model?: string;
}

export interface GeneratedArticle {
  title: string;
  description: string;
  content: string;
  tags: string[];
  suggestedCategory?: string;
}

export enum AIProviderType {
  GEMINI = 'gemini',
  OPENAI = 'openai',
  CLAUDE = 'claude',
}

/**
 * 모든 AI Provider가 구현해야 하는 인터페이스
 */
export interface IAIProvider {
  /**
   * 일반 채팅 메시지 전송
   * @param messages 대화 히스토리
   * @returns AI 응답
   */
  chat(messages: AIMessage[]): Promise<AIResponse>;

  /**
   * 대화 내용을 기반으로 기사 생성
   * @param conversationHistory 전체 대화 히스토리
   * @param customInstructions 추가 지시사항 (선택)
   * @returns 생성된 기사
   */
  generateArticle(
    conversationHistory: AIMessage[],
    customInstructions?: string
  ): Promise<GeneratedArticle>;

  /**
   * 기존 기사에 대한 수정 요청
   * @param article 현재 기사
   * @param feedback 수정 요청 내용
   * @returns 수정된 기사
   */
  refineArticle(
    article: GeneratedArticle,
    feedback: string
  ): Promise<GeneratedArticle>;

  /**
   * API 키 유효성 테스트
   * @returns 테스트 성공 여부
   */
  testConnection(): Promise<boolean>;
}
