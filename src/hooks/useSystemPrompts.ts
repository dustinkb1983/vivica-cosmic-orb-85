
import { useState, useCallback, useEffect } from 'react';

export interface SystemPrompt {
  id: string;
  name: string;
  content: string;
  isDefault?: boolean;
}

const defaultPrompts: SystemPrompt[] = [
  { 
    id: '1', 
    name: 'Default VIVICA', 
    content: 'You are VIVICA, a sophisticated AI assistant. Be helpful, concise, and engaging in your responses.',
    isDefault: true 
  },
  { 
    id: '2', 
    name: 'Professional Assistant', 
    content: 'You are a professional AI assistant. Provide clear, accurate, and formal responses.',
    isDefault: true 
  },
  { 
    id: '3', 
    name: 'Creative Helper', 
    content: 'You are a creative AI assistant. Be imaginative, inspiring, and help with creative tasks.',
    isDefault: true 
  },
];

export const useSystemPrompts = () => {
  const [prompts, setPrompts] = useState<SystemPrompt[]>(defaultPrompts);

  useEffect(() => {
    const savedPrompts = localStorage.getItem('vivica_system_prompts');
    if (savedPrompts) {
      try {
        const parsed = JSON.parse(savedPrompts);
        setPrompts([...defaultPrompts, ...parsed.filter((p: SystemPrompt) => !p.isDefault)]);
      } catch (error) {
        console.error('Error loading system prompts:', error);
      }
    }
  }, []);

  useEffect(() => {
    const customPrompts = prompts.filter(p => !p.isDefault);
    localStorage.setItem('vivica_system_prompts', JSON.stringify(customPrompts));
  }, [prompts]);

  const addPrompt = useCallback((name: string, content: string) => {
    const newPrompt: SystemPrompt = {
      id: Date.now().toString(),
      name,
      content,
      isDefault: false
    };
    setPrompts(prev => [...prev, newPrompt]);
  }, []);

  const deletePrompt = useCallback((id: string) => {
    setPrompts(prev => prev.filter(prompt => prompt.id !== id || prompt.isDefault));
  }, []);

  return {
    prompts,
    addPrompt,
    deletePrompt
  };
};
