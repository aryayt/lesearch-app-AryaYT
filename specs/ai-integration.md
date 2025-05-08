# AI Integration Specification

## Overview

Lesearch integrates advanced AI capabilities to enhance the research paper reading and understanding experience. The AI integration leverages multiple model providers, including Google's Gemini and Azure OpenAI, to provide context-aware assistance, generate reports, and help users extract insights from research papers.

## Key Features

1. **Multi-Model Support**: Integration with multiple AI providers (Gemini, Azure OpenAI)
2. **Context-Aware Chat**: AI chat that understands the content of the current paper
3. **Report Generation**: AI-generated summaries, analyses, and reports
4. **Citation Assistance**: Help with formatting and managing citations
5. **Research Enhancement**: Explanations of complex concepts and terminology

## Implementation Requirements

### AI Provider Integration

#### Gemini Integration

- Implement Google's Gemini API for general AI capabilities
- Support for Gemini Pro and Gemini Ultra models
- Handle API authentication and rate limiting
- Implement streaming responses for better UX

```typescript
// Example Gemini API integration
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateGeminiResponse = async (
  prompt: string, 
  context: string, 
  model: 'gemini-pro' | 'gemini-ultra' = 'gemini-pro'
) => {
  const geminiModel = genAI.getGenerativeModel({ model });
  
  const result = await geminiModel.generateContent({
    contents: [
      {
        role: 'user',
        parts: [{ text: `Context: ${context}\n\nQuestion: ${prompt}` }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  });
  
  return result.response.text();
};
```

#### Azure OpenAI Integration

- Implement Azure OpenAI API for advanced language capabilities
- Support for GPT-4 and other available models
- Handle API authentication and rate limiting
- Implement streaming responses for better UX

```typescript
// Example Azure OpenAI API integration
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';

const client = new OpenAIClient(
  process.env.AZURE_OPENAI_ENDPOINT,
  new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY)
);

const generateAzureOpenAIResponse = async (
  prompt: string,
  context: string,
  model: string = 'gpt-4'
) => {
  const response = await client.getChatCompletions(
    model,
    [
      { role: 'system', content: 'You are a research assistant helping with academic papers.' },
      { role: 'user', content: `Context: ${context}\n\nQuestion: ${prompt}` }
    ],
    {
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.95,
      frequencyPenalty: 0,
      presencePenalty: 0,
    }
  );
  
  return response.choices[0].message.content;
};
```

### Chat Interface

- Implement a chat interface for user-AI interaction
- Support for conversation history and context
- Ability to reference specific parts of the paper
- Code block and LaTeX rendering
- Image and diagram generation capabilities

### Report Generation

- Generate comprehensive reports from papers
- Support for different report types:
  - Executive summary
  - Key findings
  - Methodology analysis
  - Critical review
- Export reports in various formats (PDF, Markdown, HTML)
- Customizable report templates

### Context Management

- Extract and maintain paper context for AI prompts
- Chunk paper content for efficient processing
- Implement semantic search for relevant context retrieval
- Maintain conversation history with context windows

## User Interface

### Chat Panel

- Clean, intuitive chat interface
- Message threading for organized conversations
- Support for rich text formatting
- Code syntax highlighting
- LaTeX equation rendering
- Image and diagram display

### Report Builder

- Interactive report building interface
- Template selection
- Section customization
- Preview capability
- Export options

### AI Settings

- Model selection (Gemini Pro, Gemini Ultra, GPT-4, etc.)
- Temperature and creativity controls
- Token limit settings
- API key management
- Usage tracking and quotas

## Technical Implementation

### Backend API Routes

```typescript
// AI chat endpoint
export async function POST(request: Request) {
  const { prompt, context, model, provider } = await request.json();
  
  try {
    let response;
    
    if (provider === 'gemini') {
      response = await generateGeminiResponse(prompt, context, model);
    } else if (provider === 'azure') {
      response = await generateAzureOpenAIResponse(prompt, context, model);
    } else {
      throw new Error('Unsupported AI provider');
    }
    
    return Response.json({ response });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

### State Management

```typescript
// AI chat store with Zustand
interface AIChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  selectedModel: AIModel;
  selectedProvider: 'gemini' | 'azure';
  
  sendMessage: (prompt: string, context: string) => Promise<void>;
  clearChat: () => void;
  setModel: (model: AIModel) => void;
  setProvider: (provider: 'gemini' | 'azure') => void;
}

export const useAIChatStore = create<AIChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,
  selectedModel: { id: 'gemini-pro', name: 'Gemini Pro' },
  selectedProvider: 'gemini',
  
  sendMessage: async (prompt, context) => {
    const { selectedModel, selectedProvider, messages } = get();
    
    set({ isLoading: true, error: null });
    
    try {
      // Add user message to chat
      set({
        messages: [...messages, { role: 'user', content: prompt, timestamp: Date.now() }]
      });
      
      // Call API based on selected provider
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          context,
          model: selectedModel.id,
          provider: selectedProvider
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response');
      }
      
      // Add AI response to chat
      set({
        messages: [...get().messages, {
          role: 'assistant',
          content: data.response,
          timestamp: Date.now(),
          model: selectedModel.id,
          provider: selectedProvider
        }]
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  clearChat: () => set({ messages: [] }),
  setModel: (model) => set({ selectedModel: model }),
  setProvider: (provider) => set({ selectedProvider: provider })
}));
```

## Implementation Phases

1. **Phase 1**: Basic AI chat integration with Gemini
2. **Phase 2**: Context-aware prompts using paper content
3. **Phase 3**: Azure OpenAI integration and model switching
4. **Phase 4**: Advanced features (report generation, citation assistance)

## Security Considerations

- Secure API key storage using environment variables
- Rate limiting to prevent abuse
- User authentication for AI access
- Data privacy and GDPR compliance
- Content filtering for appropriate responses

## Dependencies

- Google Generative AI SDK for Gemini
- Azure OpenAI SDK for GPT models
- React Markdown for rendering responses
- KaTeX for LaTeX rendering
- Zustand for state management
