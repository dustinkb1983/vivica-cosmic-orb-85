
import React, { useState, useEffect } from 'react';
import { Key, Brain, MessageSquare, Plus, Trash2, Sliders, Volume2, VolumeX, Copy, Cloud, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedTextarea } from '@/components/ui/enhanced-textarea';
import { VoiceSettings } from '@/components/VoiceSettings';
import { useCustomModels } from '@/hooks/useCustomModels';
import { useSystemPrompts } from '@/hooks/useSystemPrompts';
import { useClipboard } from '@/hooks/useClipboard';
import { toast } from 'sonner';

interface SettingsTabContentProps {
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

export const SettingsTabContent: React.FC<SettingsTabContentProps> = ({ 
  isMuted, 
  setIsMuted 
}) => {
  const [apiKey, setApiKey] = useState('');
  const [weatherApiKey, setWeatherApiKey] = useState('');
  const [newsApiKey, setNewsApiKey] = useState('');
  const [googleTtsKey, setGoogleTtsKey] = useState('');
  const [model, setModel] = useState('deepseek/deepseek-chat');
  const [systemPrompt, setSystemPrompt] = useState('You are VIVICA, a sophisticated AI assistant. Be helpful, concise, and engaging in your responses.');
  const [temperature, setTemperature] = useState(0.7);
  const [useGoogleTTS, setUseGoogleTTS] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [googleVoice, setGoogleVoice] = useState('en-US-Standard-E');
  const [newModelName, setNewModelName] = useState('');
  const [newModelValue, setNewModelValue] = useState('');
  const [newPromptName, setNewPromptName] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');
  const [selectedPromptId, setSelectedPromptId] = useState('1');

  const { models, addModel, deleteModel } = useCustomModels();
  const { prompts, addPrompt, deletePrompt } = useSystemPrompts();
  const { copyToClipboard, pasteToField } = useClipboard();

  useEffect(() => {
    const savedApiKey = localStorage.getItem('vivica_api_key') || '';
    const savedWeatherKey = localStorage.getItem('vivica_weather_api_key') || '';
    const savedNewsKey = localStorage.getItem('vivica_news_api_key') || '';
    const savedGoogleTtsKey = localStorage.getItem('vivica_google_tts_key') || '';
    const savedModel = localStorage.getItem('vivica_model') || 'deepseek/deepseek-chat';
    const savedPrompt = localStorage.getItem('vivica_system_prompt') || 'You are VIVICA, a sophisticated AI assistant. Be helpful, concise, and engaging in your responses.';
    const savedTemperature = parseFloat(localStorage.getItem('vivica_temperature') || '0.7');
    const savedPromptId = localStorage.getItem('vivica_selected_prompt_id') || '1';
    const savedUseGoogleTTS = localStorage.getItem('vivica_use_google_tts') === 'true';
    const savedSelectedVoice = localStorage.getItem('vivica_selected_voice') || '';
    const savedGoogleVoice = localStorage.getItem('vivica_google_voice') || 'en-US-Standard-E';
    
    setApiKey(savedApiKey);
    setWeatherApiKey(savedWeatherKey);
    setNewsApiKey(savedNewsKey);
    setGoogleTtsKey(savedGoogleTtsKey);
    setModel(savedModel);
    setSystemPrompt(savedPrompt);
    setTemperature(savedTemperature);
    setSelectedPromptId(savedPromptId);
    setUseGoogleTTS(savedUseGoogleTTS);
    setSelectedVoice(savedSelectedVoice);
    setGoogleVoice(savedGoogleVoice);
  }, []);

  const handleSave = () => {
    localStorage.setItem('vivica_api_key', apiKey);
    localStorage.setItem('vivica_weather_api_key', weatherApiKey);
    localStorage.setItem('vivica_news_api_key', newsApiKey);
    localStorage.setItem('vivica_google_tts_key', googleTtsKey);
    localStorage.setItem('vivica_model', model);
    localStorage.setItem('vivica_system_prompt', systemPrompt);
    localStorage.setItem('vivica_temperature', temperature.toString());
    localStorage.setItem('vivica_selected_prompt_id', selectedPromptId);
    localStorage.setItem('vivica_use_google_tts', useGoogleTTS.toString());
    localStorage.setItem('vivica_selected_voice', selectedVoice);
    localStorage.setItem('vivica_google_voice', googleVoice);
    toast.success('Settings saved successfully');
  };

  const handleAddModel = () => {
    if (newModelName && newModelValue) {
      addModel(newModelName, newModelValue);
      setNewModelName('');
      setNewModelValue('');
    }
  };

  const handleAddPrompt = () => {
    if (newPromptName && newPromptContent) {
      addPrompt(newPromptName, newPromptContent);
      setNewPromptName('');
      setNewPromptContent('');
    }
  };

  const handlePromptSelect = (promptId: string) => {
    setSelectedPromptId(promptId);
    const selectedPrompt = prompts.find(p => p.id === promptId);
    if (selectedPrompt) {
      setSystemPrompt(selectedPrompt.content);
    }
  };

  return (
    <div className="space-y-6">
      {/* API Keys Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">API Keys</h3>
        
        {/* OpenRouter API Key */}
        <div className="space-y-2">
          <Label htmlFor="api-key" className="flex items-center gap-2 text-sm font-medium">
            <Key className="w-4 h-4" />
            OpenRouter API Key
          </Label>
          <div className="flex gap-2">
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your OpenRouter API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => pasteToField(setApiKey, 'API key pasted')}
              className="text-gray-400 hover:text-white"
              title="Paste API Key"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Weather API Key */}
        <div className="space-y-2">
          <Label htmlFor="weather-key" className="flex items-center gap-2 text-sm font-medium">
            <Cloud className="w-4 h-4" />
            Weather API Key (OpenWeatherMap)
          </Label>
          <div className="flex gap-2">
            <Input
              id="weather-key"
              type="password"
              placeholder="Enter your OpenWeatherMap API key"
              value={weatherApiKey}
              onChange={(e) => setWeatherApiKey(e.target.value)}
              className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => pasteToField(setWeatherApiKey, 'Weather API key pasted')}
              className="text-gray-400 hover:text-white"
              title="Paste Weather API Key"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* News API Key */}
        <div className="space-y-2">
          <Label htmlFor="news-key" className="flex items-center gap-2 text-sm font-medium">
            <Newspaper className="w-4 h-4" />
            News API Key
          </Label>
          <div className="flex gap-2">
            <Input
              id="news-key"
              type="password"
              placeholder="Enter your NewsAPI key"
              value={newsApiKey}
              onChange={(e) => setNewsApiKey(e.target.value)}
              className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => pasteToField(setNewsApiKey, 'News API key pasted')}
              className="text-gray-400 hover:text-white"
              title="Paste News API Key"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Google TTS API Key */}
        <div className="space-y-2">
          <Label htmlFor="google-tts-key" className="flex items-center gap-2 text-sm font-medium">
            <Volume2 className="w-4 h-4" />
            Google Text-to-Speech API Key
          </Label>
          <div className="flex gap-2">
            <Input
              id="google-tts-key"
              type="password"
              placeholder="Enter your Google Cloud TTS API key"
              value={googleTtsKey}
              onChange={(e) => setGoogleTtsKey(e.target.value)}
              className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => pasteToField(setGoogleTtsKey, 'Google TTS API key pasted')}
              className="text-gray-400 hover:text-white"
              title="Paste Google TTS API Key"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Voice Settings */}
      <VoiceSettings
        useGoogleTTS={useGoogleTTS}
        setUseGoogleTTS={setUseGoogleTTS}
        selectedVoice={selectedVoice}
        setSelectedVoice={setSelectedVoice}
        googleVoice={googleVoice}
        setGoogleVoice={setGoogleVoice}
      />

      {/* AI Model Management */}
      <div className="space-y-4">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Brain className="w-4 h-4" />
          AI Model
        </Label>
        
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700 text-white">
            {models.map((modelOption) => (
              <SelectItem key={modelOption.id} value={modelOption.value}>
                <div className="flex items-center justify-between w-full">
                  {modelOption.name}
                  {!modelOption.isDefault && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-2 text-red-400 hover:text-red-300"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteModel(modelOption.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Add Custom Model */}
        <div className="space-y-2 p-3 bg-gray-900/30 rounded-lg border border-gray-800">
          <Label className="text-xs font-medium text-gray-400">Add Custom Model</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Model name"
              value={newModelName}
              onChange={(e) => setNewModelName(e.target.value)}
              className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
            />
            <Button onClick={handleAddModel} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <Input
            placeholder="Model value (e.g., deepseek/deepseek-r1-0528-qwen3-8b:free)"
            value={newModelValue}
            onChange={(e) => setNewModelValue(e.target.value)}
            className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Temperature Control */}
      <div className="space-y-2">
        <Label htmlFor="temperature" className="flex items-center gap-2 text-sm font-medium">
          <Sliders className="w-4 h-4" />
          Temperature: {temperature}
        </Label>
        <input
          id="temperature"
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Focused (0)</span>
          <span>Balanced (1)</span>
          <span>Creative (2)</span>
        </div>
      </div>

      {/* System Prompt Management */}
      <div className="space-y-4">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <MessageSquare className="w-4 h-4" />
          System Prompt
        </Label>

        <Select value={selectedPromptId} onValueChange={handlePromptSelect}>
          <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700 text-white">
            {prompts.map((prompt) => (
              <SelectItem key={prompt.id} value={prompt.id}>
                <div className="flex items-center justify-between w-full">
                  {prompt.name}
                  {!prompt.isDefault && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-2 text-red-400 hover:text-red-300"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deletePrompt(prompt.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <EnhancedTextarea
          placeholder="Define VIVICA's personality and behavior"
          value={systemPrompt}
          onValueChange={setSystemPrompt}
          rows={4}
          className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
        />

        {/* Add Custom Prompt */}
        <div className="space-y-2 p-3 bg-gray-900/30 rounded-lg border border-gray-800">
          <Label className="text-xs font-medium text-gray-400">Save Current Prompt</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Prompt name"
              value={newPromptName}
              onChange={(e) => setNewPromptName(e.target.value)}
              className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
            />
            <Button onClick={handleAddPrompt} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <EnhancedTextarea
            placeholder="Prompt content"
            value={newPromptContent}
            onValueChange={setNewPromptContent}
            rows={2}
            className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
            showActions={false}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-6 border-t border-gray-800">
        <Button 
          onClick={() => setIsMuted(!isMuted)}
          variant="outline" 
          className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          {isMuted ? <VolumeX className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
          {isMuted ? 'Unmute' : 'Mute'}
        </Button>
        <Button 
          onClick={handleSave} 
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
};
