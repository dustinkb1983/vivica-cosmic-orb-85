
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Volume2 } from 'lucide-react';

interface VoiceSettingsProps {
  useGoogleTTS: boolean;
  setUseGoogleTTS: (value: boolean) => void;
  selectedVoice: string;
  setSelectedVoice: (value: string) => void;
  googleVoice: string;
  setGoogleVoice: (value: string) => void;
}

const googleVoices = [
  { id: 'en-US-Standard-A', name: 'Standard A (Male)' },
  { id: 'en-US-Standard-B', name: 'Standard B (Male)' },
  { id: 'en-US-Standard-C', name: 'Standard C (Female)' },
  { id: 'en-US-Standard-D', name: 'Standard D (Male)' },
  { id: 'en-US-Standard-E', name: 'Standard E (Female)' },
  { id: 'en-US-Standard-F', name: 'Standard F (Female)' },
  { id: 'en-US-Standard-G', name: 'Standard G (Female)' },
  { id: 'en-US-Standard-H', name: 'Standard H (Female)' },
  { id: 'en-US-Standard-I', name: 'Standard I (Male)' },
  { id: 'en-US-Standard-J', name: 'Standard J (Male)' }
];

export const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  useGoogleTTS,
  setUseGoogleTTS,
  selectedVoice,
  setSelectedVoice,
  googleVoice,
  setGoogleVoice
}) => {
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setBrowserVoices(voices.filter(voice => voice.lang.startsWith('en')));
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  return (
    <div className="space-y-4">
      <Label className="flex items-center gap-2 text-sm font-medium">
        <Volume2 className="w-4 h-4" />
        Voice Settings
      </Label>

      {/* Google TTS Toggle */}
      <div className="flex items-center justify-between">
        <Label htmlFor="google-tts" className="text-sm">Use Google Text-to-Speech</Label>
        <Switch
          id="google-tts"
          checked={useGoogleTTS}
          onCheckedChange={setUseGoogleTTS}
        />
      </div>

      {useGoogleTTS ? (
        <div className="space-y-2">
          <Label className="text-sm text-gray-400">Google Voice</Label>
          <Select value={googleVoice} onValueChange={setGoogleVoice}>
            <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700 text-white">
              {googleVoices.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  {voice.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-2">
          <Label className="text-sm text-gray-400">Browser Voice</Label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700 text-white">
              {browserVoices.map((voice) => (
                <SelectItem key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};
