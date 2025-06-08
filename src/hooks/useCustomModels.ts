
import { useState, useCallback, useEffect } from 'react';

export interface CustomModel {
  id: string;
  name: string;
  value: string;
  isDefault?: boolean;
}

const defaultModels: CustomModel[] = [
  { id: '1', name: 'DeepSeek Chat', value: 'deepseek/deepseek-chat', isDefault: true },
  { id: '2', name: 'Llama 3.2 3B', value: 'meta-llama/llama-3.2-3b-instruct', isDefault: true },
  { id: '3', name: 'Llama 3.2 11B Vision', value: 'meta-llama/llama-3.2-11b-vision-instruct', isDefault: true },
  { id: '4', name: 'GPT-4o Mini', value: 'openai/gpt-4o-mini', isDefault: true },
];

export const useCustomModels = () => {
  const [models, setModels] = useState<CustomModel[]>(defaultModels);

  useEffect(() => {
    const savedModels = localStorage.getItem('vivica_custom_models');
    if (savedModels) {
      try {
        const parsed = JSON.parse(savedModels);
        setModels([...defaultModels, ...parsed.filter((m: CustomModel) => !m.isDefault)]);
      } catch (error) {
        console.error('Error loading custom models:', error);
      }
    }
  }, []);

  useEffect(() => {
    const customModels = models.filter(m => !m.isDefault);
    localStorage.setItem('vivica_custom_models', JSON.stringify(customModels));
  }, [models]);

  const addModel = useCallback((name: string, value: string) => {
    const newModel: CustomModel = {
      id: Date.now().toString(),
      name,
      value,
      isDefault: false
    };
    setModels(prev => [...prev, newModel]);
  }, []);

  const deleteModel = useCallback((id: string) => {
    setModels(prev => prev.filter(model => model.id !== id || model.isDefault));
  }, []);

  return {
    models,
    addModel,
    deleteModel
  };
};
