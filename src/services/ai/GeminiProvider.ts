import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  IAIProvider,
  AIMessage,
  AIResponse,
  GeneratedArticle,
} from './AIProvider.interface';

/**
 * Google Gemini AI Provider 구현
 */
export class GeminiProvider implements IAIProvider {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    // gemini-1.5-flash: 빠르고 효율적, 무료 티어
    this.model = this.genAI.getGenerativeModel(
      { model: 'gemini-1.5-flash' },
      { apiVersion: 'v1beta' }
    );
  }

  /**
   * Gemini 메시지 형식으로 변환
   */
  private convertMessages(messages: AIMessage[]): any[] {
    return messages
      .filter(msg => msg.role !== 'system')  // Gemini는 system role을 직접 지원하지 않음
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));
  }

  /**
   * System 프롬프트 추출
   */
  private getSystemPrompt(messages: AIMessage[]): string | null {
    const systemMsg = messages.find(msg => msg.role === 'system');
    return systemMsg ? systemMsg.content : null;
  }

  /**
   * 일반 채팅
   */
  async chat(messages: AIMessage[]): Promise<AIResponse> {
    try {
      const systemPrompt = this.getSystemPrompt(messages);
      const geminiMessages = this.convertMessages(messages);

      // System 프롬프트가 있으면 첫 메시지에 포함
      if (systemPrompt && geminiMessages.length > 0) {
        geminiMessages[0].parts[0].text = `${systemPrompt}\n\n${geminiMessages[0].parts[0].text}`;
      }

      const chat = this.model.startChat({
        history: geminiMessages.slice(0, -1),  // 마지막 메시지 제외
      });

      const lastMessage = geminiMessages[geminiMessages.length - 1];
      const result = await chat.sendMessage(lastMessage.parts[0].text);
      const response = result.response;

      return {
        content: response.text(),
        model: 'gemini-1.5-flash',
      };
    } catch (error: any) {
      console.error('Gemini chat error:', error);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  /**
   * 기사 생성
   */
  async generateArticle(
    conversationHistory: AIMessage[],
    customInstructions?: string
  ): Promise<GeneratedArticle> {
    try {
      const articlePrompt = this.buildArticlePrompt(conversationHistory, customInstructions);

      const result = await this.model.generateContent(articlePrompt);
      const response = result.response;
      const articleText = response.text();

      // JSON 응답 파싱
      return this.parseArticleResponse(articleText);
    } catch (error: any) {
      console.error('Gemini generate article error:', error);
      throw new Error(`Failed to generate article: ${error.message}`);
    }
  }

  /**
   * 기사 수정
   */
  async refineArticle(
    article: GeneratedArticle,
    feedback: string
  ): Promise<GeneratedArticle> {
    try {
      const refinePrompt = `
다음은 작성된 기사입니다:

제목: ${article.title}
요약: ${article.description}
내용:
${article.content}

사용자 피드백: ${feedback}

위 피드백을 반영하여 기사를 수정해주세요. 응답은 반드시 아래 JSON 형식으로만 작성하세요:

{
  "title": "수정된 제목",
  "description": "수정된 요약 (2-3문장)",
  "content": "수정된 Markdown 내용",
  "tags": ["태그1", "태그2", "태그3"],
  "suggestedCategory": "추천 카테고리"
}
`;

      const result = await this.model.generateContent(refinePrompt);
      const response = result.response;
      const articleText = response.text();

      return this.parseArticleResponse(articleText);
    } catch (error: any) {
      console.error('Gemini refine article error:', error);
      throw new Error(`Failed to refine article: ${error.message}`);
    }
  }

  /**
   * API 연결 테스트
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.model.generateContent('Hello');
      return !!result.response.text();
    } catch (error) {
      console.error('Gemini connection test failed:', error);
      return false;
    }
  }

  /**
   * 기사 생성 프롬프트 구성
   */
  private buildArticlePrompt(
    conversationHistory: AIMessage[],
    customInstructions?: string
  ): string {
    const conversationText = conversationHistory
      .filter(msg => msg.role !== 'system')
      .map(msg => `${msg.role === 'user' ? '사용자' : 'AI'}: ${msg.content}`)
      .join('\n\n');

    return `
당신은 코딩 관련 뉴스 기사를 작성하는 전문 에디터입니다.
다음 대화 내용을 바탕으로 흥미롭고 정보가 풍부한 기사를 작성해주세요.

대화 내용:
${conversationText}

${customInstructions ? `\n추가 지시사항: ${customInstructions}\n` : ''}

기사 작성 가이드라인:
1. 제목은 흥미롭고 클릭을 유도해야 합니다 (50자 이내)
2. 요약은 기사의 핵심을 2-3문장으로 담아야 합니다
3. 내용은 Markdown 형식으로 작성하세요
4. 적절한 헤딩(##, ###), 리스트, 코드 블록을 사용하세요
5. 객관적이고 정확한 정보를 제공하세요
6. 3-5개의 관련 태그를 추천하세요

응답은 반드시 아래 JSON 형식으로만 작성하세요:

{
  "title": "기사 제목",
  "description": "기사 요약 (2-3문장)",
  "content": "Markdown 형식의 기사 본문",
  "tags": ["태그1", "태그2", "태그3"],
  "suggestedCategory": "ALGORITHM 또는 WEB_DEVELOPMENT 등 추천 카테고리"
}
`;
  }

  /**
   * AI 응답에서 JSON 파싱
   */
  private parseArticleResponse(responseText: string): GeneratedArticle {
    try {
      // JSON 코드 블록 제거
      let jsonText = responseText.trim();

      // ```json ... ``` 형식 제거
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json\s*/, '').replace(/```\s*$/, '');
      }

      const parsed = JSON.parse(jsonText);

      return {
        title: parsed.title || 'Untitled Article',
        description: parsed.description || '',
        content: parsed.content || '',
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        suggestedCategory: parsed.suggestedCategory || 'WEB_DEVELOPMENT',
      };
    } catch (error) {
      console.error('Failed to parse article response:', error);
      console.error('Raw response:', responseText);

      // 파싱 실패 시 기본 구조 반환
      return {
        title: '기사 생성 완료',
        description: '기사가 생성되었습니다.',
        content: responseText,
        tags: [],
        suggestedCategory: 'WEB_DEVELOPMENT',
      };
    }
  }
}
