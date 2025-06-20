import {
  customProvider,
} from 'ai';

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';

export async function initializeProvider(provider: string, apiKey: string) {
  if (!apiKey) {
    throw new Error(`${provider} API key is required. Please set your API key in the settings.`);
  }

  if (provider === 'google') {
    const google = createGoogleGenerativeAI({
      apiKey,
    });

    return customProvider({
      languageModels: {
        'gemini-2.5-pro-preview-05-06': google('gemini-2.5-pro-preview-05-06'),
        'gemini-2.5-flash-preview-04-17': google('gemini-2.5-flash-preview-04-17'),
        'gemini-2.5-pro-exp-03-25': google('gemini-2.5-pro-exp-03-25'),
        'gemini-2.0-flash': google('gemini-2.0-flash'),
        'gemini-1.5-pro': google('gemini-1.5-pro'),
        'gemini-1.5-pro-latest': google('gemini-1.5-pro-latest'),
        'gemini-1.5-flash': google('gemini-1.5-flash'),
        'gemini-1.5-flash-latest': google('gemini-1.5-flash-latest'),
        'gemini-1.5-flash-8b': google('gemini-1.5-flash-8b'),
        'gemini-1.5-flash-8b-latest': google('gemini-1.5-flash-8b-latest'),
      },
      textEmbeddingModels:{
        'gemini-embedding':google.textEmbeddingModel('text-embedding-004', {
          outputDimensionality: 512,
          taskType: 'SEMANTIC_SIMILARITY',
        }),
      }
    });
  } else if (provider === 'openai') {
    return customProvider({
      languageModels: {
        'gpt-4o-mini': openai('gpt-4o-mini'),
        'gpt-4o': openai('gpt-4o'),
        'gpt-4': openai('gpt-4'),
        'gpt-3.5-turbo': openai('gpt-3.5-turbo'),
      },
      textEmbeddingModels:{
        'text-embedding-3-small': openai.textEmbeddingModel('text-embedding-3-small'),
        'text-embedding-3-large': openai.textEmbeddingModel('text-embedding-3-large'),
      }
    });
  }

  throw new Error(`Unsupported provider: ${provider}`);
}