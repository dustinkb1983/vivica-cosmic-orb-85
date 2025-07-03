
import React, { useState } from 'react';
import { X, Settings as SettingsIcon, MessageSquare, User, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SettingsTabContent } from './SettingsTabContent';
import { ProfileManagement } from './ProfileManagement';
import { ConversationHistoryContent } from './ConversationHistoryContent';

interface GlassmorphicSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

type SettingsTab = 'profiles' | 'settings' | 'history' | 'keys';

export const GlassmorphicSettingsModal: React.FC<GlassmorphicSettingsModalProps> = ({
  isOpen,
  onClose,
  isMuted,
  setIsMuted
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profiles');

  if (!isOpen) return null;

  const tabs = [
    { id: 'profiles' as const, label: 'Profiles', icon: User, description: 'Manage AI personas' },
    { id: 'settings' as const, label: 'Settings', icon: SettingsIcon, description: 'App preferences' },
    { id: 'history' as const, label: 'History', icon: MessageSquare, description: 'Conversation log' },
    { id: 'keys' as const, label: 'API Keys', icon: Key, description: 'Service credentials' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profiles':
        return <ProfileManagement />;
      case 'settings':
        return <SettingsTabContent isMuted={isMuted} setIsMuted={setIsMuted} />;
      case 'history':
        return <ConversationHistoryContent />;
      case 'keys':
        return <SettingsTabContent isMuted={isMuted} setIsMuted={setIsMuted} />;
      default:
        return <ProfileManagement />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative w-full max-w-4xl max-h-[90vh] bg-gray-950/95 backdrop-blur-xl border-gray-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Vivica Settings
            </h2>
            <Badge variant="outline" className="border-purple-500/30 text-purple-400">
              v1.0
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/5'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <CardContent className="p-6 overflow-y-auto max-h-[60vh]">
          {renderTabContent()}
        </CardContent>
      </Card>
    </div>
  );
};
