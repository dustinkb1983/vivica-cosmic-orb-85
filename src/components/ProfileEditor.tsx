
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedTextarea } from '@/components/ui/enhanced-textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { X, Save, Palette } from 'lucide-react';
import { VivicaProfile } from '@/hooks/useProfiles';
import { useCustomModels } from '@/hooks/useCustomModels';

interface ProfileEditorProps {
  profile?: VivicaProfile;
  onSave: (profile: Omit<VivicaProfile, 'id'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const MAX_CONTEXT_OPTIONS = [
  { value: 2048, label: '2K tokens' },
  { value: 4096, label: '4K tokens' },
  { value: 8192, label: '8K tokens' },
  { value: 16384, label: '16K tokens' },
  { value: 32768, label: '32K tokens' },
  { value: 65536, label: '64K tokens' },
  { value: 131072, label: '128K tokens' }
];

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ 
  profile, 
  onSave, 
  onCancel, 
  isEditing = false 
}) => {
  const [formData, setFormData] = useState<Omit<VivicaProfile, 'id'>>({
    name: profile?.name || '',
    systemPrompt: profile?.systemPrompt || 'You are VIVICA, a sophisticated AI assistant. Be helpful, concise, and engaging in your responses.',
    temperature: profile?.temperature || 0.7,
    model: profile?.model || 'deepseek/deepseek-chat',
    maxContextLength: profile?.maxContextLength || 8192,
    topP: profile?.topP || 0.9,
    presencePenalty: profile?.presencePenalty || 0,
    frequencyPenalty: profile?.frequencyPenalty || 0,
    orbColors: profile?.orbColors || {
      idle: '#580060',
      listening: '#9048F8',
      processing: '#E830E8',
      speaking: '#8038F0'
    }
  });

  const { models } = useCustomModels();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return;
    }
    onSave(formData);
  };

  const updateFormData = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateOrbColor = (state: keyof typeof formData.orbColors, color: string) => {
    setFormData(prev => ({
      ...prev,
      orbColors: { ...prev.orbColors, [state]: color }
    }));
  };

  return (
    <Card className="w-full max-w-4xl bg-gray-950/95 backdrop-blur-md border-gray-800 text-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-800">
        <CardTitle className="text-xl font-bold">
          {isEditing ? `Edit Profile: ${profile?.name}` : 'Create New Profile'}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-6 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Name */}
          <div className="space-y-2">
            <Label htmlFor="profile-name" className="text-sm font-medium">
              Profile Name
            </Label>
            <Input
              id="profile-name"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              placeholder="e.g., Vivica: Sultry Guide"
              className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
              required
            />
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">System Prompt</Label>
            <EnhancedTextarea
              value={formData.systemPrompt}
              onValueChange={(value) => updateFormData('systemPrompt', value)}
              placeholder="Define your AI persona's personality, behavior, and instructions"
              rows={6}
              className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Model */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">AI Model</Label>
              <Select value={formData.model} onValueChange={(value) => updateFormData('model', value)}>
                <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 text-white">
                  {models.map((modelOption) => (
                    <SelectItem key={modelOption.id} value={modelOption.value}>
                      {modelOption.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Max Context Length */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Max Context Length</Label>
              <Select 
                value={formData.maxContextLength?.toString() || '8192'} 
                onValueChange={(value) => updateFormData('maxContextLength', parseInt(value))}
              >
                <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 text-white">
                  {MAX_CONTEXT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Temperature */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Temperature: {formData.temperature}
              </Label>
              <Slider
                value={[formData.temperature]}
                onValueChange={(value) => updateFormData('temperature', value[0])}
                min={0}
                max={2}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Focused (0)</span>
                <span>Balanced (1)</span>
                <span>Creative (2)</span>
              </div>
            </div>

            {/* Top P */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Top P: {formData.topP}
              </Label>
              <Slider
                value={[formData.topP || 0.9]}
                onValueChange={(value) => updateFormData('topP', value[0])}
                min={0}
                max={1}
                step={0.05}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Deterministic (0)</span>
                <span>Diverse (1)</span>
              </div>
            </div>

            {/* Presence Penalty */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Presence Penalty: {formData.presencePenalty}
              </Label>
              <Slider
                value={[formData.presencePenalty || 0]}
                onValueChange={(value) => updateFormData('presencePenalty', value[0])}
                min={-2}
                max={2}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Repetitive (-2)</span>
                <span>Diverse (+2)</span>
              </div>
            </div>

            {/* Frequency Penalty */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Frequency Penalty: {formData.frequencyPenalty}
              </Label>
              <Slider
                value={[formData.frequencyPenalty || 0]}
                onValueChange={(value) => updateFormData('frequencyPenalty', value[0])}
                min={-2}
                max={2}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Repetitive (-2)</span>
                <span>Varied (+2)</span>
              </div>
            </div>
          </div>

          {/* Orb Colors */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Palette className="w-4 h-4" />
              Orb Colors
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(formData.orbColors).map(([state, color]) => (
                <div key={state} className="space-y-2">
                  <Label className="text-xs text-gray-400 capitalize">{state}</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => updateOrbColor(state as keyof typeof formData.orbColors, e.target.value)}
                      className="w-8 h-8 rounded border border-gray-700 bg-transparent cursor-pointer"
                    />
                    <Input
                      value={color}
                      onChange={(e) => updateOrbColor(state as keyof typeof formData.orbColors, e.target.value)}
                      className="bg-gray-900/50 border-gray-700 text-white text-xs h-8"
                      placeholder="#580060"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <Button 
              type="button"
              onClick={onCancel} 
              variant="outline" 
              className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? 'Update Profile' : 'Create Profile'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
