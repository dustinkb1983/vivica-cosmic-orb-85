
import { useCallback } from 'react';
import { toast } from 'sonner';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const useOpenRouter = () => {
  const generateResponse = useCallback(async (
    message: string, 
    contextMessages: Message[] = []
  ): Promise<string | null> => {
    const apiKey = localStorage.getItem('vivica_api_key');
    const model = localStorage.getItem('vivica_model') || 'deepseek/deepseek-chat';
    const systemPrompt = localStorage.getItem('vivica_system_prompt') || 'You are VIVICA, a sophisticated AI assistant. Be helpful, concise, and engaging in your responses.';
    const temperature = parseFloat(localStorage.getItem('vivica_temperature') || '0.7');

    if (!apiKey) {
      toast.error('Please set your OpenRouter API key in settings');
      return null;
    }

    try {
      // Build messages array with system prompt, context, and current message
      const messages: Message[] = [
        {
          role: 'system',
          content: systemPrompt
        },
        ...contextMessages,
        {
          role: 'user',
          content: message
        }
      ];

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'VIVICA Voice Assistant'
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: temperature,
          max_tokens: 500,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from API');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenRouter API error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate response');
      return null;
    }
  }, []);

  return { generateResponse };
};
