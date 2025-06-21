
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Check, User, Brain, Palette } from 'lucide-react';
import { useProfiles, VivicaProfile } from '@/hooks/useProfiles';
import { ProfileEditor } from './ProfileEditor';

export const ProfileManagement: React.FC = () => {
  const { profiles, activeProfileId, addProfile, updateProfile, deleteProfile, setActiveProfile } = useProfiles();
  const [showEditor, setShowEditor] = useState(false);
  const [editingProfile, setEditingProfile] = useState<VivicaProfile | null>(null);

  const handleCreateProfile = () => {
    setEditingProfile(null);
    setShowEditor(true);
  };

  const handleEditProfile = (profile: VivicaProfile) => {
    setEditingProfile(profile);
    setShowEditor(true);
  };

  const handleSaveProfile = (profileData: Omit<VivicaProfile, 'id'>) => {
    if (editingProfile) {
      updateProfile(editingProfile.id, profileData);
    } else {
      addProfile(profileData);
    }
    setShowEditor(false);
    setEditingProfile(null);
  };

  const handleCancelEdit = () => {
    setShowEditor(false);
    setEditingProfile(null);
  };

  if (showEditor) {
    return (
      <ProfileEditor
        profile={editingProfile || undefined}
        onSave={handleSaveProfile}
        onCancel={handleCancelEdit}
        isEditing={!!editingProfile}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white">AI Profiles</h3>
          <p className="text-sm text-gray-400">Create and manage different AI personas</p>
        </div>
        <Button onClick={handleCreateProfile} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Profile
        </Button>
      </div>

      <div className="grid gap-4">
        {profiles.map((profile) => (
          <Card
            key={profile.id}
            className={`bg-gray-900/50 border-gray-700 hover:bg-gray-900/70 transition-colors cursor-pointer ${
              activeProfileId === profile.id ? 'ring-2 ring-blue-500 border-blue-500/50' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-400" />
                    <CardTitle className="text-white text-lg">{profile.name}</CardTitle>
                    {activeProfileId === profile.id && (
                      <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border-blue-500/30">
                        <Check className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}
                    {profile.isDefault && (
                      <Badge variant="outline" className="border-gray-600 text-gray-400">
                        Default
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {activeProfileId !== profile.id && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveProfile(profile.id)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      Apply
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditProfile(profile)}
                    className="text-gray-400 hover:text-white hover:bg-gray-800"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {!profile.isDefault && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteProfile(profile.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <p className="text-sm text-gray-300 line-clamp-2">
                  {profile.systemPrompt}
                </p>
                
                <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    <span>{profile.model}</span>
                  </div>
                  <div>Temp: {profile.temperature}</div>
                  {profile.maxContextLength && (
                    <div>Context: {(profile.maxContextLength / 1024).toFixed(0)}K</div>
                  )}
                  <div className="flex items-center gap-1">
                    <Palette className="w-3 h-3" />
                    <div className="flex gap-1">
                      {Object.values(profile.orbColors).map((color, idx) => (
                        <div
                          key={idx}
                          className="w-3 h-3 rounded-full border border-gray-600"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {profiles.length === 1 && (
        <Card className="bg-gray-900/30 border-gray-700 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <User className="w-12 h-12 text-gray-500 mb-4" />
            <h4 className="text-lg font-medium text-gray-300 mb-2">Create Your First Custom Profile</h4>
            <p className="text-sm text-gray-500 mb-4 max-w-md">
              Design unique AI personas with custom prompts, behaviors, and visual themes
            </p>
            <Button onClick={handleCreateProfile} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Profile
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
