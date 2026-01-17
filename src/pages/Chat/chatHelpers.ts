import type { ChatMessage } from '@/services/chatService';

export function createUserMessage(content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role: 'user',
    content: content.trim(),
    timestamp: new Date(),
  };
}

export function createAssistantMessage(content: string, suggestedQuestions?: string[]): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role: 'assistant',
    content,
    timestamp: new Date(),
    suggestedQuestions,
  };
}

export function createErrorMessage(): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: "I'm sorry, I encountered an error processing your message. Please try again.",
    timestamp: new Date(),
  };
}

export function createGreetingMessage(): ChatMessage {
  return {
    id: '0',
    role: 'assistant',
    content: `Hello! 👋 I'm here to help you find information about dogs available for adoption and rescue organizations in the UK. What would you like to know?`,
    timestamp: new Date(),
  };
}
