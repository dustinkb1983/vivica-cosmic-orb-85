
import { useState, useCallback, useEffect } from 'react';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export const useConversationHistory = () => {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('vivica_conversation_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setMessages(parsed);
      } catch (error) {
        console.error('Error loading conversation history:', error);
      }
    }
  }, []);

  // Save to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem('vivica_conversation_history', JSON.stringify(messages));
  }, [messages]);

  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    const message: ConversationMessage = {
      id: Date.now().toString() + Math.random().toString(36),
      role,
      content,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, message]);
  }, []);

  const editMessage = useCallback((id: string, newContent: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, content: newContent } : msg
    ));
  }, []);

  const deleteMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem('vivica_conversation_history');
  }, []);

  const getContextMessages = useCallback((maxMessages: number = 10) => {
    return messages.slice(-maxMessages).map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }, [messages]);

  return {
    messages,
    addMessage,
    editMessage,
    deleteMessage,
    clearHistory,
    getContextMessages
  };
};
