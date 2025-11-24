import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import {
  IAIProvider,
  AIMessage,
  AIResponse,
  GeneratedArticle,
} from './AIProvider.interface';
import { searchWeb, formatSearchResults } from '../../utils/webSearch';

/**
 * Google Gemini AI Provider 구현
 */
export class GeminiProvider implements IAIProvider {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private modelWithTools: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);

    // 기본 모델 (도구 없음)
    this.model = this.genAI.getGenerativeModel(
      { model: 'gemini-2.5-flash' },
      { apiVersion: 'v1beta' }
    );

    // 웹 검색 도구가 있는 모델
    this.modelWithTools = this.genAI.getGenerativeModel(
      {
        model: 'gemini-2.5-flash',
        tools: [{
          functionDeclarations: [{
            name: 'web_search',
            description: '최신 정보, 뉴스, 최근 개발 동향을 검색합니다. 2023년 이후의 정보가 필요할 때 사용하세요.',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                query: {
                  type: SchemaType.STRING,
                  description: '검색할 쿼리 (한국어 또는 영어)',
                },
              },
              required: ['query'],
            },
          }],
        }],
      },
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
   * 일반 채팅 (웹 검색 지원)
   */
  async chat(messages: AIMessage[]): Promise<AIResponse> {
    try {
      const systemPrompt = this.getSystemPrompt(messages);
      const geminiMessages = this.convertMessages(messages);

      // System 프롬프트가 있으면 첫 메시지에 포함
      if (systemPrompt && geminiMessages.length > 0) {
        geminiMessages[0].parts[0].text = `${systemPrompt}\n\n${geminiMessages[0].parts[0].text}`;
      }

      const chat = this.modelWithTools.startChat({
        history: geminiMessages.slice(0, -1),
      });

      const lastMessage = geminiMessages[geminiMessages.length - 1];
      let result = await chat.sendMessage(lastMessage.parts[0].text);
      let response = result.response;

      // Function Call 처리
      let functionCall = response.functionCalls()?.[0];

      if (functionCall) {
        console.log('AI가 웹 검색을 요청했습니다:', functionCall.args);

        if (functionCall.name === 'web_search') {
          // 웹 검색 수행
          const searchQuery = functionCall.args.query as string;
          const searchResult = await searchWeb(searchQuery);
          const formattedResults = formatSearchResults(searchResult);

          // 검색 결과를 AI에게 전달
          result = await chat.sendMessage([{
            functionResponse: {
              name: 'web_search',
              response: {
                content: formattedResults,
              },
            },
          }]);

          response = result.response;
        }
      }

      return {
        content: response.text(),
        model: 'gemini-2.5-flash',
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
3. 내용은 Markdown 형식으로 작성하세요 (## 제목, **강조**, 리스트, 코드 블록 등)
4. 내용에 적절한 줄바꿈(\\n\\n)을 넣어 가독성을 높이세요
5. 객관적이고 정확한 정보를 제공하세요
6. 3-5개의 관련 태그를 추천하세요

**중요**: 응답은 반드시 순수 JSON 형식으로만 작성하세요. 다른 텍스트는 포함하지 마세요.

형식:
{
  "title": "기사 제목",
  "description": "기사 요약 (2-3문장)",
  "content": "Markdown 형식의 기사 본문\\n\\n단락 구분을 위해 줄바꿈을 반드시 포함하세요",
  "tags": ["태그1", "태그2", "태그3"],
  "suggestedCategory": "ALGORITHM"
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

      // ```json ... ``` 형식 제거 (여러 패턴 지원)
      if (jsonText.includes('```')) {
        // ```json 또는 ``` 패턴 찾기
        const jsonMatch = jsonText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1];
        } else {
          // 마지막 ```까지 제거
          jsonText = jsonText.replace(/^```(?:json)?\s*/, '').replace(/```\s*$/, '');
        }
      }

      // JSON 파싱
      const parsed = JSON.parse(jsonText);

      // 검증
      if (!parsed.title || !parsed.content) {
        throw new Error('Missing required fields in parsed JSON');
      }

      return {
        title: parsed.title,
        description: parsed.description || '',
        content: parsed.content,
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        suggestedCategory: parsed.suggestedCategory || 'WEB_DEVELOPMENT',
      };
    } catch (error) {
      console.error('Failed to parse article response:', error);
      console.error('Raw response:', responseText.substring(0, 500));

      // 파싱 실패 시 에러 발생 (잘못된 데이터를 저장하지 않도록)
      throw new Error('AI가 올바른 형식의 기사를 생성하지 못했습니다. 다시 시도해주세요.');
    }
  }
}
