
import React, { useState } from 'react';
import { X, User, Settings, Key, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GlassmorphicSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHistory: () => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

export const GlassmorphicSettingsModal: React.FC<GlassmorphicSettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenHistory,
  isMuted,
  setIsMuted
}) => {
  const [aiName, setAiName] = useState('VIVICA');
  const [speechMode, setSpeechMode] = useState('hold-to-talk');
  const [theme, setTheme] = useState('dark');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-auto">
        <div 
          className="relative rounded-3xl p-6 shadow-2xl border border-white/20"
          style={{
            background: 'linear-gradient(135deg, rgba(144, 72, 248, 0.15) 0%, rgba(232, 48, 232, 0.15) 50%, rgba(128, 56, 240, 0.15) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(144, 72, 248, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200"
          >
            <X className="w-4 h-4 text-white/80" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white tracking-wider">V I V I C A</h2>
            <p className="text-white/60 text-sm mt-1">AI Assistant Settings</p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="profiles" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/10 rounded-xl p-1 mb-6">
              <TabsTrigger 
                value="profiles" 
                className="rounded-lg text-xs data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60"
              >
                <User className="w-3 h-3 mr-1" />
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="rounded-lg text-xs data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60"
              >
                <Settings className="w-3 h-3 mr-1" />
                Settings
              </TabsTrigger>
              <TabsTrigger 
                value="apikeys" 
                className="rounded-lg text-xs data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60"
              >
                <Key className="w-3 h-3 mr-1" />
                API Keys
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="rounded-lg text-xs data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60"
              >
                <MessageSquare className="w-3 h-3 mr-1" />
                History
              </TabsTrigger>
            </TabsList>

            {/* Profiles Tab */}
            <TabsContent value="profiles" className="space-y-4 max-h-80 overflow-y-auto">
              <div>
                <Label className="text-white/80 text-sm">AI Name</Label>
                <Input
                  value={aiName}
                  onChange={(e) => setAiName(e.target.value)}
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  placeholder="Enter AI name"
                />
              </div>
              
              <div>
                <Label className="text-white/80 text-sm">Temperature</Label>
                <Select defaultValue="0.7">
                  <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.3">Conservative (0.3)</SelectItem>
                    <SelectItem value="0.7">Balanced (0.7)</SelectItem>
                    <SelectItem value="1.0">Creative (1.0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white/80 text-sm mb-2 block">Orb Colors</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-white/60 text-xs">Idle</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input type="color" defaultValue="#580060" className="w-8 h-8 rounded border-0 bg-transparent" />
                      <span className="text-white/60 text-xs">#580060</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-white/60 text-xs">Listening</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input type="color" defaultValue="#9048F8" className="w-8 h-8 rounded border-0 bg-transparent" />
                      <span className="text-white/60 text-xs">#9048F8</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-white/60 text-xs">Processing</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input type="color" defaultValue="#E830E8" className="w-8 h-8 rounded border-0 bg-transparent" />
                      <span className="text-white/60 text-xs">#E830E8</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-white/60 text-xs">Speaking</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input type="color" defaultValue="#8038F0" className="w-8 h-8 rounded border-0 bg-transparent" />
                      <span className="text-white/60 text-xs">#8038F0</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4 max-h-80 overflow-y-auto">
              <div>
                <Label className="text-white/80 text-sm">Speech Mode</Label>
                <Select value={speechMode} onValueChange={setSpeechMode}>
                  <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hold-to-talk">Hold to Talk</SelectItem>
                    <SelectItem value="tap-to-talk">Tap to Talk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white/80 text-sm">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-white/80 text-sm">Mute Responses</Label>
                <Switch
                  checked={isMuted}
                  onCheckedChange={setIsMuted}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-white/80 text-sm">Typing Animation</Label>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-white/80 text-sm">Weather Integration</Label>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-white/80 text-sm">News Integration</Label>
                <Switch />
              </div>
            </TabsContent>

            {/* API Keys Tab */}
            <TabsContent value="apikeys" className="space-y-4 max-h-80 overflow-y-auto">
              <div>
                <Label className="text-white/80 text-sm">OpenRouter API Key</Label>
                <Input
                  type="password"
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  placeholder="sk-or-..."
                />
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-xs text-white/60">Connected</span>
                </div>
              </div>

              <div>
                <Label className="text-white/80 text-sm">Google Cloud TTS Key</Label>
                <Input
                  type="password"
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  placeholder="Enter API key"
                />
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  <span className="text-xs text-white/60">Not configured</span>
                </div>
              </div>

              <div>
                <Label className="text-white/80 text-sm">OpenWeather API Key</Label>
                <Input
                  type="password"
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  placeholder="Enter API key"
                />
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  <span className="text-xs text-white/60">Not configured</span>
                </div>
              </div>

              <div>
                <Label className="text-white/80 text-sm">News API Key</Label>
                <Input
                  type="password"
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  placeholder="Enter API key"
                />
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  <span className="text-xs text-white/60">Not configured</span>
                </div>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-4 max-h-80 overflow-y-auto">
              <div className="flex items-center justify-between">
                <Label className="text-white/80 text-sm">Conversation History</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onOpenHistory}
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  View All
                </Button>
              </div>
              
              <Input
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                placeholder="Search conversations..."
              />

              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-white/10 border border-white/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/80 text-sm font-medium">Today's Chat</span>
                    <span className="text-white/60 text-xs">2:30 PM</span>
                  </div>
                  <p className="text-white/60 text-xs line-clamp-2">What's the weather like today? It's going to be partly cloudy with a high of 72°F...</p>
                </div>
                
                <div className="p-3 rounded-lg bg-white/10 border border-white/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/80 text-sm font-medium">Morning Questions</span>
                    <span className="text-white/60 text-xs">9:15 AM</span>
                  </div>
                  <p className="text-white/60 text-xs line-clamp-2">Tell me about quantum computing. Quantum computing is a type of computation that...</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-white/60 hover:text-white hover:bg-white/10"
                >
                  Export All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  Clear History
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
