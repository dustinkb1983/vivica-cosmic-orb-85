
import { useCallback } from 'react';
import { toast } from 'sonner';

export const useOpenRouter = () => {
  const generateResponse = useCallback(async (message: string): Promise<string | null> => {
    const apiKey = localStorage.getItem('vivica_api_key');
    const model = localStorage.getItem('vivica_model') || 'deepseek/deepseek-chat';
    const systemPrompt = localStorage.getItem('vivica_system_prompt') || 'You are VIVICA, a sophisticated AI assistant. Be helpful, concise, and engaging in your responses.';

    if (!apiKey) {
      toast.error('Please set your OpenRouter API key in settings');
      return null;
    }

    try {
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
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: message
            }
          ],
          temperature: 0.7,
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
