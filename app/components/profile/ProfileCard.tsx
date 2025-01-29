'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import ProfileForm from '@/app/components/profile/ProfileForm';
import { Plus, UserRoundPen } from 'lucide-react';

interface Profile {
  avatar_url?: string;
  username: string;
  full_name: string;
  short_bio: string;
}

export default function ProfileCard({
  initialProfile,
}: {
  initialProfile: Profile;
  userId: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(initialProfile);
  const router = useRouter();

  interface UpdatedProfile {
    avatar_url?: string;
    username: string;
    full_name: string;
    short_bio: string;
  }

  const handleEditComplete = (updatedProfile: UpdatedProfile): void => {
    setProfile(updatedProfile);
    setIsEditing(false);
    router.refresh();
  };

  return (
    <Card className='mb-8 bg-card border border-border'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <Avatar className='h-20 w-20'>
              <AvatarImage
                src={profile.avatar_url || ''}
                alt={profile.username || ''}
              />
              <AvatarFallback>
                {profile.full_name
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className='text-2xl'>{profile.full_name}</CardTitle>
              <p className='text-foreground/80'>
                {profile.username ? `@${profile.username}` : ''}
              </p>
              {profile.short_bio && (
                <p className='text-foreground/80'>{profile.short_bio || ''}</p>
              )}
            </div>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <Plus className='rotate-45 h-4 w-4' />
            ) : (
              <UserRoundPen className='h-4 w-4' />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className='p-0'>
        {isEditing ? (
          <ProfileForm
            initialProfile={profile}
            onEditComplete={handleEditComplete}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
