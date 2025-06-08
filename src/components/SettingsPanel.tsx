
import React, { useState, useEffect } from 'react';
import { X, Key, Brain, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('deepseek/deepseek-chat');
  const [systemPrompt, setSystemPrompt] = useState('You are VIVICA, a sophisticated AI assistant. Be helpful, concise, and engaging in your responses.');

  useEffect(() => {
    // Load settings from localStorage
    const savedApiKey = localStorage.getItem('vivica_api_key') || '';
    const savedModel = localStorage.getItem('vivica_model') || 'deepseek/deepseek-chat';
    const savedPrompt = localStorage.getItem('vivica_system_prompt') || 'You are VIVICA, a sophisticated AI assistant. Be helpful, concise, and engaging in your responses.';
    
    setApiKey(savedApiKey);
    setModel(savedModel);
    setSystemPrompt(savedPrompt);
  }, []);

  const handleSave = () => {
    localStorage.setItem('vivica_api_key', apiKey);
    localStorage.setItem('vivica_model', model);
    localStorage.setItem('vivica_system_prompt', systemPrompt);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/80 backdrop-blur-md border-white/20 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-bold">VIVICA Settings</CardTitle>
            <CardDescription className="text-white/70">
              Configure your AI assistant
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6" onKeyDown={handleKeyDown}>
          <div className="space-y-2">
            <Label htmlFor="api-key" className="flex items-center gap-2 text-sm font-medium">
              <Key className="w-4 h-4" />
              OpenRouter API Key
            </Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your OpenRouter API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
            <p className="text-xs text-white/60">
              Get your API key from{' '}
              <a 
                href="https://openrouter.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                openrouter.ai
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model" className="flex items-center gap-2 text-sm font-medium">
              <Brain className="w-4 h-4" />
              AI Model
            </Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/20 text-white">
                <SelectItem value="deepseek/deepseek-chat">DeepSeek Chat</SelectItem>
                <SelectItem value="meta-llama/llama-3.2-3b-instruct">Llama 3.2 3B</SelectItem>
                <SelectItem value="meta-llama/llama-3.2-11b-vision-instruct">Llama 3.2 11B Vision</SelectItem>
                <SelectItem value="openai/gpt-4o-mini">GPT-4o Mini</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="system-prompt" className="flex items-center gap-2 text-sm font-medium">
              <MessageSquare className="w-4 h-4" />
              System Prompt
            </Label>
            <Textarea
              id="system-prompt"
              placeholder="Define VIVICA's personality and behavior"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={3}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={onClose} 
              variant="outline" 
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
