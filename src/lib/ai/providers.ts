import {
  customProvider,
} from 'ai';

import { createGoogleGenerativeAI } from '@ai-sdk/google';

// Validate API key
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error('GOOGLE_API_KEY is not set in environment variables');
  throw new Error('Google API key is required. Please set GOOGLE_API_KEY in your environment variables.');
}

const google = createGoogleGenerativeAI({
  apiKey,
});

export const googleProvider = customProvider({
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
          outputDimensionality: 512, // optional, number of dimensions for the embedding
          taskType: 'SEMANTIC_SIMILARITY', // optional, specifies the task type for generating embeddings
        }),
      }
    });