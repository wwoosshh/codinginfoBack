import { IAIProvider, AIProviderType } from './AIProvider.interface';
import { GeminiProvider } from './GeminiProvider';

/**
 * AI Provider Factory
 * 선택한 AI 제공자에 따라 적절한 Provider 인스턴스 생성
 */
export class AIProviderFactory {
  /**
   * AI Provider 생성
   * @param type AI 제공자 타입
   * @param apiKey API 키 (복호화된 평문)
   * @returns AI Provider 인스턴스
   */
  static createProvider(type: AIProviderType, apiKey: string): IAIProvider {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error(`API key is required for ${type}`);
    }

    switch (type) {
      case AIProviderType.GEMINI:
        return new GeminiProvider(apiKey);

      case AIProviderType.OPENAI:
        // TODO: OpenAI Provider 구현 후 추가
        throw new Error('OpenAI provider is not yet implemented. Coming soon!');

      case AIProviderType.CLAUDE:
        // TODO: Claude Provider 구현 후 추가
        throw new Error('Claude provider is not yet implemented. Coming soon!');

      default:
        throw new Error(`Unknown AI provider type: ${type}`);
    }
  }

  /**
   * 사용 가능한 AI Provider 목록
   */
  static getAvailableProviders(): AIProviderType[] {
    return [
      AIProviderType.GEMINI,
      // AIProviderType.OPENAI,  // 구현 후 주석 해제
      // AIProviderType.CLAUDE,  // 구현 후 주석 해제
    ];
  }

  /**
   * AI Provider가 구현되었는지 확인
   */
  static isProviderImplemented(type: AIProviderType): boolean {
    return this.getAvailableProviders().includes(type);
  }
}
