import { Request, Response } from 'express';
import AIConfiguration from '../models/AIConfiguration';
import { encryptApiKey, decryptApiKey, maskApiKey } from '../utils/encryption';
import { AIProviderType } from '../services/ai/AIProvider.interface';
import { AIProviderFactory } from '../services/ai/AIProviderFactory';

/**
 * AI 설정 조회
 */
export const getAIConfig = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    let config = await AIConfiguration.findOne({ userId });

    // 설정이 없으면 기본 설정 생성
    if (!config) {
      config = new AIConfiguration({
        userId,
        providers: {
          gemini: {
            enabled: false,
          },
          openai: {
            enabled: false,
          },
          claude: {
            enabled: false,
          },
        },
        defaultProvider: AIProviderType.GEMINI,
      });
      await config.save();
    }

    // API 키를 마스킹하여 응답
    const safeConfig = {
      defaultProvider: config.defaultProvider,
      providers: {
        gemini: {
          hasApiKey: !!config.providers.gemini?.apiKey,
          apiKeyMasked: config.providers.gemini?.apiKey
            ? maskApiKey(decryptApiKey(config.providers.gemini.apiKey))
            : null,
          enabled: config.providers.gemini?.enabled || false,
          lastTested: config.providers.gemini?.lastTested,
          lastTestSuccess: config.providers.gemini?.lastTestSuccess,
        },
        openai: {
          hasApiKey: !!config.providers.openai?.apiKey,
          apiKeyMasked: config.providers.openai?.apiKey
            ? maskApiKey(decryptApiKey(config.providers.openai.apiKey))
            : null,
          enabled: config.providers.openai?.enabled || false,
          lastTested: config.providers.openai?.lastTested,
          lastTestSuccess: config.providers.openai?.lastTestSuccess,
        },
        claude: {
          hasApiKey: !!config.providers.claude?.apiKey,
          apiKeyMasked: config.providers.claude?.apiKey
            ? maskApiKey(decryptApiKey(config.providers.claude.apiKey))
            : null,
          enabled: config.providers.claude?.enabled || false,
          lastTested: config.providers.claude?.lastTested,
          lastTestSuccess: config.providers.claude?.lastTestSuccess,
        },
      },
    };

    res.json(safeConfig);
  } catch (error) {
    console.error('Get AI config error:', error);
    res.status(500).json({ message: 'Failed to get AI configuration' });
  }
};

/**
 * AI 설정 업데이트
 */
export const updateAIConfig = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { defaultProvider, providers } = req.body;

    let config = await AIConfiguration.findOne({ userId });

    if (!config) {
      config = new AIConfiguration({ userId });
    }

    // 기본 제공자 업데이트
    if (defaultProvider) {
      config.defaultProvider = defaultProvider;
    }

    // 각 제공자 설정 업데이트
    if (providers) {
      for (const [providerName, providerData] of Object.entries(providers) as [string, any][]) {
        if (!config.providers) {
          config.providers = {};
        }

        if (!config.providers[providerName as keyof typeof config.providers]) {
          config.providers[providerName as keyof typeof config.providers] = {
            enabled: false,
          } as any;
        }

        const provider = config.providers[providerName as keyof typeof config.providers];

        if (!provider) continue;

        // API 키 업데이트 (제공된 경우만)
        if (providerData.apiKey && providerData.apiKey.trim() !== '') {
          provider.apiKey = encryptApiKey(providerData.apiKey);
        }

        // 활성화 상태 업데이트
        if (typeof providerData.enabled === 'boolean') {
          provider.enabled = providerData.enabled;
        }
      }
    }

    await config.save();

    res.json({ message: 'AI configuration updated successfully' });
  } catch (error) {
    console.error('Update AI config error:', error);
    res.status(500).json({ message: 'Failed to update AI configuration' });
  }
};

/**
 * API 키 테스트
 */
export const testAIProvider = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { provider } = req.params;
    const { apiKey: testApiKey } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!Object.values(AIProviderType).includes(provider as AIProviderType)) {
      return res.status(400).json({ message: 'Invalid provider type' });
    }

    // Provider가 구현되었는지 확인
    if (!AIProviderFactory.isProviderImplemented(provider as AIProviderType)) {
      return res.status(400).json({ message: `${provider} is not yet implemented` });
    }

    const config = await AIConfiguration.findOne({ userId });

    // 테스트할 API 키 결정 (요청에서 제공되면 사용, 아니면 저장된 키 사용)
    let apiKeyToTest: string;

    if (testApiKey && testApiKey.trim() !== '') {
      apiKeyToTest = testApiKey;
    } else if (config?.providers[provider as keyof typeof config.providers]?.apiKey) {
      const encryptedKey = config.providers[provider as keyof typeof config.providers]!.apiKey!;
      apiKeyToTest = decryptApiKey(encryptedKey);
    } else {
      return res.status(400).json({ message: 'No API key provided for testing' });
    }

    // Provider 생성 및 연결 테스트
    const aiProvider = AIProviderFactory.createProvider(provider as AIProviderType, apiKeyToTest);
    const testResult = await aiProvider.testConnection();

    // 테스트 결과 저장
    if (config) {
      const providerConfig = config.providers[provider as keyof typeof config.providers];
      if (providerConfig) {
        providerConfig.lastTested = new Date();
        providerConfig.lastTestSuccess = testResult;
        await config.save();
      }
    }

    if (testResult) {
      res.json({ success: true, message: `${provider} API connection successful` });
    } else {
      res.status(400).json({ success: false, message: `${provider} API connection failed` });
    }
  } catch (error: any) {
    console.error('Test AI provider error:', error);
    res.status(500).json({ success: false, message: error.message || 'API test failed' });
  }
};

/**
 * 활성화된 제공자 목록 조회
 */
export const getEnabledProviders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const config = await AIConfiguration.findOne({ userId });

    if (!config) {
      return res.json({ providers: [], defaultProvider: AIProviderType.GEMINI });
    }

    const enabledProviders = Object.entries(config.providers || {})
      .filter(([_, data]) => data?.enabled && data?.apiKey)
      .map(([name]) => name);

    res.json({
      providers: enabledProviders,
      defaultProvider: config.defaultProvider,
    });
  } catch (error) {
    console.error('Get enabled providers error:', error);
    res.status(500).json({ message: 'Failed to get enabled providers' });
  }
};
