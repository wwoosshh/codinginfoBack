import { tavily } from '@tavily/core';

/**
 * Tavily API를 사용한 웹 검색
 */
export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface WebSearchResponse {
  query: string;
  results: SearchResult[];
  answer?: string;
}

/**
 * 웹 검색 수행
 */
export async function searchWeb(query: string): Promise<WebSearchResponse> {
  try {
    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey) {
      throw new Error('TAVILY_API_KEY is not set');
    }

    const tvly = tavily({ apiKey });

    // Tavily 검색 수행
    const response = await tvly.search(query, {
      searchDepth: 'basic', // 'basic' 또는 'advanced'
      maxResults: 5,
      includeAnswer: true, // AI 요약 포함
      includeRawContent: false,
    });

    return {
      query,
      results: response.results.map((result: any) => ({
        title: result.title,
        url: result.url,
        content: result.content,
        score: result.score,
      })),
      answer: response.answer,
    };
  } catch (error: any) {
    console.error('Web search error:', error);
    throw new Error(`Failed to search web: ${error.message}`);
  }
}

/**
 * 검색 결과를 AI가 읽을 수 있는 형식으로 변환
 */
export function formatSearchResults(searchResponse: WebSearchResponse): string {
  let formatted = `웹 검색 결과 (검색어: "${searchResponse.query}"):\n\n`;

  if (searchResponse.answer) {
    formatted += `요약: ${searchResponse.answer}\n\n`;
  }

  formatted += '상세 결과:\n';
  searchResponse.results.forEach((result, index) => {
    formatted += `${index + 1}. ${result.title}\n`;
    formatted += `   출처: ${result.url}\n`;
    formatted += `   내용: ${result.content}\n\n`;
  });

  return formatted;
}
