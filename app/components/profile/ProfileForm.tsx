'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/hooks/use-toast';
import { updateUserProfile } from '../../(site)/profile/action';

interface Profile {
  avatar_url?: string;
  username: string;
  full_name: string;
  short_bio: string;
}

interface ProfileFormProps {
  initialProfile: Profile;
  onEditComplete: (profile: Profile) => void;
}

export default function ProfileForm({
  initialProfile,
  onEditComplete,
}: ProfileFormProps) {
  const [profile, setProfile] = useState({
    ...initialProfile,
    username: initialProfile.username || '',
    short_bio: initialProfile.short_bio || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev: Profile) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('username', profile.username || '');
      formData.append('short_bio', profile.short_bio || '');

      const updatedProfile = await updateUserProfile(formData);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
      onEditComplete(updatedProfile);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  interface AvatarUploadEvent extends React.ChangeEvent<HTMLInputElement> {
    target: HTMLInputElement & { files: FileList };
  }

  const handleAvatarUpload = async (e: AvatarUploadEvent) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const updatedProfile = await updateUserProfile(formData);
      setProfile((prevProfile) => ({
        ...prevProfile,
        avatar_url: updatedProfile.avatar_url,
      }));
      toast({
        title: 'Avatar Updated',
        description: 'Your profile picture has been successfully updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update avatar. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4 p-6'>
      <div>
        <Label htmlFor='username'>Username</Label>
        <Input
          id='username'
          name='username'
          value={profile.username || ''}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <Label htmlFor='short_bio'>Short Bio</Label>
        <Input
          id='short_bio'
          name='short_bio'
          value={profile.short_bio || ''}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <Label htmlFor='avatar'>Avatar</Label>
        <Input
          id='avatar'
          name='avatar'
          type='file'
          onChange={handleAvatarUpload}
          accept='image/*'
        />
      </div>
      <Button type='submit'>Save Changes</Button>
    </form>
  );
}
