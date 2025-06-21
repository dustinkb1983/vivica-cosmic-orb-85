
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface VivicaProfile {
  id: string;
  name: string;
  systemPrompt: string;
  temperature: number;
  model: string;
  maxContextLength?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  orbColors: {
    idle: string;
    listening: string;
    processing: string;
    speaking: string;
  };
  isDefault?: boolean;
}

const DEFAULT_PROFILES: VivicaProfile[] = [
  {
    id: '1',
    name: 'VIVICA',
    systemPrompt: 'You are VIVICA, a sophisticated AI assistant. Be helpful, concise, and engaging in your responses.',
    temperature: 0.7,
    model: 'deepseek/deepseek-chat',
    maxContextLength: 8192,
    topP: 0.9,
    presencePenalty: 0,
    frequencyPenalty: 0,
    orbColors: {
      idle: '#580060',
      listening: '#9048F8',
      processing: '#E830E8',
      speaking: '#8038F0'
    },
    isDefault: true
  }
];

export const useProfiles = () => {
  const [profiles, setProfiles] = useState<VivicaProfile[]>(DEFAULT_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState<string>('1');

  useEffect(() => {
    const savedProfiles = localStorage.getItem('vivica_profiles');
    const savedActiveId = localStorage.getItem('vivica_active_profile_id');
    
    if (savedProfiles) {
      try {
        const parsedProfiles = JSON.parse(savedProfiles);
        setProfiles([...DEFAULT_PROFILES, ...parsedProfiles.filter((p: VivicaProfile) => !p.isDefault)]);
      } catch (error) {
        console.error('Failed to parse saved profiles:', error);
      }
    }
    
    if (savedActiveId) {
      setActiveProfileId(savedActiveId);
    }
  }, []);

  const saveProfiles = (newProfiles: VivicaProfile[]) => {
    const customProfiles = newProfiles.filter(p => !p.isDefault);
    localStorage.setItem('vivica_profiles', JSON.stringify(customProfiles));
    setProfiles(newProfiles);
  };

  const addProfile = (profile: Omit<VivicaProfile, 'id'>) => {
    const newProfile: VivicaProfile = {
      ...profile,
      id: Date.now().toString()
    };
    const newProfiles = [...profiles, newProfile];
    saveProfiles(newProfiles);
    toast.success(`Profile "${profile.name}" created successfully`);
    return newProfile.id;
  };

  const updateProfile = (id: string, updates: Partial<VivicaProfile>) => {
    const newProfiles = profiles.map(p => 
      p.id === id ? { ...p, ...updates } : p
    );
    saveProfiles(newProfiles);
    toast.success('Profile updated successfully');
  };

  const deleteProfile = (id: string) => {
    const profile = profiles.find(p => p.id === id);
    if (profile?.isDefault) {
      toast.error('Cannot delete default profile');
      return;
    }
    
    const newProfiles = profiles.filter(p => p.id !== id);
    saveProfiles(newProfiles);
    
    if (activeProfileId === id) {
      setActiveProfile('1'); // Switch to default
    }
    
    toast.success(`Profile "${profile?.name}" deleted`);
  };

  const setActiveProfile = (id: string) => {
    const profile = profiles.find(p => p.id === id);
    if (!profile) return;
    
    setActiveProfileId(id);
    localStorage.setItem('vivica_active_profile_id', id);
    
    // Apply profile settings to localStorage for immediate use
    localStorage.setItem('vivica_system_prompt', profile.systemPrompt);
    localStorage.setItem('vivica_temperature', profile.temperature.toString());
    localStorage.setItem('vivica_model', profile.model);
    if (profile.maxContextLength) {
      localStorage.setItem('vivica_max_context_length', profile.maxContextLength.toString());
    }
    if (profile.topP !== undefined) {
      localStorage.setItem('vivica_top_p', profile.topP.toString());
    }
    if (profile.presencePenalty !== undefined) {
      localStorage.setItem('vivica_presence_penalty', profile.presencePenalty.toString());
    }
    if (profile.frequencyPenalty !== undefined) {
      localStorage.setItem('vivica_frequency_penalty', profile.frequencyPenalty.toString());
    }
    
    // Save orb colors
    localStorage.setItem('vivica_orb_colors', JSON.stringify(profile.orbColors));
    
    toast.success(`Switched to profile: ${profile.name}`);
  };

  const getActiveProfile = () => {
    return profiles.find(p => p.id === activeProfileId) || profiles[0];
  };

  return {
    profiles,
    activeProfileId,
    activeProfile: getActiveProfile(),
    addProfile,
    updateProfile,
    deleteProfile,
    setActiveProfile
  };
};
