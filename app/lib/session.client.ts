/**
 * Client-side session management for the chatbot
 */

import { useState } from 'react';

export class SessionManager {
  private static readonly SESSION_KEY = 'chatbot_session_id';
  private static readonly MESSAGES_KEY = 'chatbot_messages';

  /**
   * Generate a unique session ID
   */
  static generateSessionId(): string {
    return crypto.randomUUID();
  }

  /**
   * Get or create session ID
   */
  static getSessionId(): string {
    if (typeof window === 'undefined') return '';

    let sessionId = sessionStorage.getItem(this.SESSION_KEY);
    if (!sessionId) {
      sessionId = this.generateSessionId();
      sessionStorage.setItem(this.SESSION_KEY, sessionId);
    }
    return sessionId;
  }

  /**
   * Clear session ID
   */
  static clearSession(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(this.SESSION_KEY);
      sessionStorage.removeItem(this.MESSAGES_KEY);
    }
  }

  /**
   * Save messages to session storage
   */
  static saveMessages(messages: ChatMessage[]): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(this.MESSAGES_KEY, JSON.stringify(messages));
    }
  }

  /**
   * Load messages from session storage
   */
  static loadMessages(): ChatMessage[] {
    if (typeof window === 'undefined') return [];

    const stored = sessionStorage.getItem(this.MESSAGES_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Clear messages from session storage
   */
  static clearMessages(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(this.MESSAGES_KEY);
    }
  }

  /**
   * Validate session ID format
   */
  static validateSessionId(sessionId: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(sessionId);
  }
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  recommendedProducts?: ProductRecommendation[];
}

export interface ProductRecommendation {
  name: string;
  price: string;
  features: string[];
  benefits: string[];
  availability: string;
  productUrl: string;
}

/**
 * Hook for managing chat session
 */
export function useChatSession() {
  const [sessionId] = useState(() => SessionManager.getSessionId());
  const [messages, setMessages] = useState<ChatMessage[]>(() => SessionManager.loadMessages());

  const addMessage = (message: ChatMessage) => {
    const newMessages = [...messages, message];
    setMessages(newMessages);
    SessionManager.saveMessages(newMessages);
  };

  const clearSession = () => {
    setMessages([]);
    SessionManager.clearSession();
  };

  return {
    sessionId,
    messages,
    addMessage,
    clearSession,
  };
}
