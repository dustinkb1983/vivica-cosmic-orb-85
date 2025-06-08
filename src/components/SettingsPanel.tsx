
import React, { useState, useEffect } from 'react';
import { X, Key, Brain, MessageSquare, Plus, Trash2, Sliders, History, Volume2, VolumeX, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCustomModels } from '@/hooks/useCustomModels';
import { useSystemPrompts } from '@/hooks/useSystemPrompts';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHistory: () => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  isOpen, 
  onClose, 
  onOpenHistory, 
  isMuted, 
  setIsMuted 
}) => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('deepseek/deepseek-chat');
  const [systemPrompt, setSystemPrompt] = useState('You are VIVICA, a sophisticated AI assistant. Be helpful, concise, and engaging in your responses.');
  const [temperature, setTemperature] = useState(0.7);
  const [newModelName, setNewModelName] = useState('');
  const [newModelValue, setNewModelValue] = useState('');
  const [newPromptName, setNewPromptName] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');
  const [selectedPromptId, setSelectedPromptId] = useState('1');
  const [activeTab, setActiveTab] = useState('settings');

  const { models, addModel, deleteModel } = useCustomModels();
  const { prompts, addPrompt, deletePrompt } = useSystemPrompts();

  useEffect(() => {
    const savedApiKey = localStorage.getItem('vivica_api_key') || '';
    const savedModel = localStorage.getItem('vivica_model') || 'deepseek/deepseek-chat';
    const savedPrompt = localStorage.getItem('vivica_system_prompt') || 'You are VIVICA, a sophisticated AI assistant. Be helpful, concise, and engaging in your responses.';
    const savedTemperature = parseFloat(localStorage.getItem('vivica_temperature') || '0.7');
    const savedPromptId = localStorage.getItem('vivica_selected_prompt_id') || '1';
    
    setApiKey(savedApiKey);
    setModel(savedModel);
    setSystemPrompt(savedPrompt);
    setTemperature(savedTemperature);
    setSelectedPromptId(savedPromptId);
  }, []);

  const handleSave = () => {
    localStorage.setItem('vivica_api_key', apiKey);
    localStorage.setItem('vivica_model', model);
    localStorage.setItem('vivica_system_prompt', systemPrompt);
    localStorage.setItem('vivica_temperature', temperature.toString());
    localStorage.setItem('vivica_selected_prompt_id', selectedPromptId);
    onClose();
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-settings-panel>
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-950/95 backdrop-blur-md border-gray-800 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-800">
          <div>
            <CardTitle className="text-xl font-bold">VIVICA Settings</CardTitle>
            <CardDescription className="text-gray-400">
              Configure your AI assistant
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenHistory}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <History className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 p-6" onKeyDown={handleKeyDown}>
          {/* Tab Navigation */}
          <div className="flex gap-2 border-b border-gray-800">
            <Button
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('settings')}
              className="flex-1"
            >
              Settings
            </Button>
            <Button
              variant={activeTab === 'instructions' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('instructions')}
              className="flex-1"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Instructions
            </Button>
          </div>

          {activeTab === 'instructions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">How to use VIVICA</h3>
              
              <div className="space-y-4 text-sm text-gray-300">
                <div>
                  <h4 className="font-medium text-white mb-2">Getting Started</h4>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>Get an API key from <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">openrouter.ai</a></li>
                    <li>Enter your API key in the Settings tab</li>
                    <li>Choose an AI model (DeepSeek recommended for free usage)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">Voice Interaction</h4>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li><strong>Desktop:</strong> Press Space bar to activate/deactivate voice mode</li>
                    <li><strong>Mobile:</strong> Tap anywhere on the screen to activate</li>
                    <li><strong>Settings:</strong> Hold/long-press for 500ms to open settings</li>
                    <li>VIVICA will listen continuously and respond with voice when activated</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">Visual Feedback</h4>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li><strong>Cyan-Green:</strong> Listening to your voice</li>
                    <li><strong>Golden-Yellow:</strong> Processing your request</li>
                    <li><strong>Coral-Red:</strong> Speaking response</li>
                    <li><strong>Gray:</strong> Idle/inactive</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">Advanced Features</h4>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>Add custom AI models from OpenRouter</li>
                    <li>Create and save custom system prompts</li>
                    <li>Adjust temperature for creativity vs. focus</li>
                    <li>View and edit conversation history</li>
                    <li>All settings stored locally on your device</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <>
              {/* API Key */}
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
                  className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                />
                <p className="text-xs text-gray-500">
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

                <Textarea
                  placeholder="Define VIVICA's personality and behavior"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={4}
                  className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 resize-none"
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
                  <Textarea
                    placeholder="Prompt content"
                    value={newPromptContent}
                    onChange={(e) => setNewPromptContent(e.target.value)}
                    rows={2}
                    className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 resize-none"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={onClose} 
              variant="outline" 
              className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            {activeTab === 'settings' && (
              <Button 
                onClick={handleSave} 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save Settings
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
