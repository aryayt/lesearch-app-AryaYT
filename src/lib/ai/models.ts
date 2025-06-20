interface GoogleModel {
  id: string;
  name: string;
  description: string;
  inputFormats: string[];
  outputFormats: string[];
}

interface OpenAIModel {
  id: string;
  name: string;
  description: string;
  inputFormats: string[];
  outputFormats: string[];
}

export const googleModels: Array<GoogleModel> = [
  {
    id: 'gemini-2.5-flash-preview-05-20',
    name: 'Gemini 2.5 Flash Preview 05-20',
    description: 'Optimized for adaptive thinking and cost efficiency.',
    inputFormats: ['audio', 'images', 'videos', 'text'],
    outputFormats: ['text']
  },
  {
    id: 'gemini-2.5-flash-preview-native-audio-dialog',
    name: 'Gemini 2.5 Flash Native Audio',
    description: 'Optimized for high quality, natural conversational audio outputs.',
    inputFormats: ['audio', 'videos', 'text'],
    outputFormats: ['text', 'audio']
  },
  {
    id: 'gemini-2.5-flash-exp-native-audio-thinking-dialog',
    name: 'Gemini 2.5 Flash Native Audio Thinking',
    description: 'Optimized for high quality, natural conversational audio outputs with thinking.',
    inputFormats: ['audio', 'videos', 'text'],
    outputFormats: ['text', 'audio']
  },
  {
    id: 'gemini-2.5-flash-preview-tts',
    name: 'Gemini 2.5 Flash Preview TTS',
    description: 'Optimized for low latency, controllable text-to-speech audio generation.',
    inputFormats: ['text'],
    outputFormats: ['audio']
  },
  {
    id: 'gemini-2.5-pro-preview-06-05',
    name: 'Gemini 2.5 Pro Preview',
    description: 'Optimized for enhanced thinking and reasoning, multimodal understanding, and advanced coding.',
    inputFormats: ['audio', 'images', 'videos', 'text'],
    outputFormats: ['text']
  },
  {
    id: 'gemini-2.5-pro-preview-tts',
    name: 'Gemini 2.5 Pro Preview TTS',
    description: 'Optimized for low latency, controllable text-to-speech audio generation.',
    inputFormats: ['text'],
    outputFormats: ['audio']
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: 'Optimized for next generation features, speed, thinking, and realtime streaming.',
    inputFormats: ['audio', 'images', 'videos', 'text'],
    outputFormats: ['text']
  },
  {
    id: 'gemini-2.0-flash-preview-image-generation',
    name: 'Gemini 2.0 Flash Preview Image Generation',
    description: 'Optimized for conversational image generation and editing.',
    inputFormats: ['audio', 'images', 'videos', 'text'],
    outputFormats: ['text', 'images']
  },
  {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash-Lite',
    description: 'Optimized for cost efficiency and low latency.',
    inputFormats: ['audio', 'images', 'videos', 'text'],
    outputFormats: ['text']
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: 'Optimized for fast and versatile performance across diverse tasks.',
    inputFormats: ['audio', 'images', 'videos', 'text'],
    outputFormats: ['text']
  },
  {
    id: 'gemini-1.5-flash-8b',
    name: 'Gemini 1.5 Flash-8B',
    description: 'Optimized for high volume and lower intelligence tasks.',
    inputFormats: ['audio', 'images', 'videos', 'text'],
    outputFormats: ['text']
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: 'Optimized for complex reasoning tasks requiring more intelligence.',
    inputFormats: ['audio', 'images', 'videos', 'text'],
    outputFormats: ['text']
  },
  {
    id: 'gemini-embedding-exp',
    name: 'Gemini Embedding',
    description: 'Optimized for measuring the relatedness of text strings.',
    inputFormats: ['text'],
    outputFormats: ['text embeddings']
  },
  {
    id: 'imagen-3.0-generate-002',
    name: 'Imagen 3',
    description: 'Our most advanced image generation model.',
    inputFormats: ['text'],
    outputFormats: ['images']
  },
  {
    id: 'veo-2.0-generate-001',
    name: 'Veo 2',
    description: 'High quality video generation.',
    inputFormats: ['text', 'images'],
    outputFormats: ['video']
  },
  {
    id: 'gemini-2.0-flash-live-001',
    name: 'Gemini 2.0 Flash Live',
    description: 'Optimized for low-latency bidirectional voice and video interactions.',
    inputFormats: ['audio', 'video', 'text'],
    outputFormats: ['text', 'audio']
  }
];

export const openaiModels: Array<OpenAIModel> = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'GPT-4o Mini is a general-purpose model that can be used for a variety of tasks.',
    inputFormats: ['text'],
    outputFormats: ['text']
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'GPT-4o is a general-purpose model that can be used for a variety of tasks.',
    inputFormats: ['text'],
    outputFormats: ['text']
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'GPT-4 is a general-purpose model that can be used for a variety of tasks.',
    inputFormats: ['text'],
    outputFormats: ['text']
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'GPT-3.5 Turbo is a general-purpose model that can be used for a variety of tasks.',
    inputFormats: ['text'],
    outputFormats: ['text']
  }
];
