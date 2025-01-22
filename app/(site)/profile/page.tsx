'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';

import { toast } from '@/components/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { FishingStatistics } from '@/app/components/stastistics';

type Profile = {
  id: string;
  full_name: string;
  username?: string | null;
  avatar_url?: string | null;
  short_bio?: string | null;
};

type FishCatch = {
  fish_type: string;
  caught_on: string;
};

type FishingTrip = {
  id: string;
  user_id: string;
  date: string;
  time_of_day: string;
  location: string;
  weather: string;
  notes: string | null;
  image_url: string | null;
  catch_count: number;
  fish_catches: FishCatch[];
};

export default function ProfilePage() {
  const [trips, setTrips] = useState<FishingTrip[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [newShortBio, setNewShortBio] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndTrips = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setError(profileError.message);
        } else {
          setProfile(profileData);
          setNewUsername(profileData.username || '');
          setNewShortBio(profileData.short_bio || '');
        }

        const { data: tripsData, error: tripsError } = await supabase
          .from('fishing_trips')
          .select('*')
          .eq('user_id', user.id);
        if (tripsError) {
          console.error('Error fetching trips:', tripsError);
          setError(tripsError.message);
        } else {
          setTrips(tripsData);
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    };

    fetchUserAndTrips();
  }, [router]);

  const handleUpdateProfile = async () => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername, short_bio: newShortBio })
        .eq('id', user.id);

      if (error) throw error;

      setProfile({ ...profile, username: newUsername, short_bio: newShortBio });
      setEditMode(false);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : null));
      toast({
        title: 'Avatar Updated',
        description: 'Your profile picture has been successfully updated.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload profile picture. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <LoadingSpinner fill='fill-primary' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex justify-center items-center mx-auto h-screen'>
        <Card className='border border-border flex flex-col items-center'>
          <CardContent className='text-red-500 mb-4 font-semibold'>
            Error: {error}
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='flex justify-center items-center mx-auto h-screen'>
        <Card className='border border-border flex flex-col items-center'>
          <CardContent className='text-lg font-semibold'>
            You need to log in to view your profile
          </CardContent>
          <CardFooter>
            <Link href='/login'>
              <Button className='mt-4'>Log in</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <main className='container mx-auto px-4 py-8 bg-background'>
        <Card className='mb-8 bg-card border border-border'>
          <CardHeader>
            <div className='flex items-center justify-between space-x-4'>
              <div className='flex items-center space-x-4'>
                <Avatar className='h-20 w-20'>
                  <AvatarImage
                    src={profile?.avatar_url || ''}
                    alt={profile?.full_name || ''}
                  />
                  <AvatarFallback>
                    {user.user_metadata.full_name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  {editMode ? (
                    <div className='space-y-2'>
                      <Input
                        value={newUsername}
                        placeholder='Username'
                        onChange={(e) => setNewUsername(e.target.value)}
                        className='mb-2 text-base'
                      />
                      <Input
                        value={newShortBio}
                        placeholder='Short Bio'
                        onChange={(e) => setNewShortBio(e.target.value)}
                        className='mb-2 text-base'
                      />
                    </div>
                  ) : (
                    <>
                      <CardTitle className='text-2xl'>
                        {profile?.full_name || user.user_metadata.full_name}
                      </CardTitle>
                      <p className='text-foreground/80'>
                        @{profile?.username || ''}
                      </p>
                      {profile?.short_bio && (
                        <p className='text-foreground/80'>
                          {profile?.short_bio || ''}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center space-x-2 '>
            <label className='cursor-pointer'>
              <Input
                type='file'
                className='hidden'
                onChange={handleAvatarUpload}
                accept='image/*'
              />
              <Button variant='outline' size='sm' asChild>
                <span>
                  <Upload className='h-4 w-4 mr-2' />
                  Update Avatar
                </span>
              </Button>
            </label>
            {editMode ? (
              <Button variant='default' size='sm' onClick={handleUpdateProfile}>
                Save
              </Button>
            ) : (
              <Button
                variant='secondary'
                size='sm'
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>
        <div className='flex flex-col items-center h-screen'>
          <p>No fishing trips logged yet. Start logging your trips!</p>
          <Link href='/logbook'>
            <Button className='mt-4'>Log a trip</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className='container mx-auto px-4 py-8 bg-background'>
      <Card className='mb-8 bg-card border border-border'>
        <CardHeader>
          <div className='flex items-center justify-between space-x-4'>
            <div className='flex items-center space-x-4'>
              <Avatar className='h-20 w-20'>
                <AvatarImage
                  src={profile?.avatar_url || ''}
                  alt={profile?.username || ''}
                />
                <AvatarFallback>
                  {user.user_metadata.full_name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                {editMode ? (
                  <div className='space-y-2'>
                    <Input
                      value={newUsername}
                      placeholder='Username'
                      onChange={(e) => setNewUsername(e.target.value)}
                      className='mb-2 text-base'
                    />
                    <Input
                      value={newShortBio}
                      placeholder='Short Bio'
                      onChange={(e) => setNewShortBio(e.target.value)}
                      className='mb-2 text-base'
                    />
                  </div>
                ) : (
                  <>
                    <CardTitle className='text-2xl'>
                      {profile?.full_name || user.user_metadata.full_name}
                    </CardTitle>
                    <p className='text-foreground/80'>
                      @{profile?.username || ''}
                    </p>
                    {profile?.short_bio && (
                      <p className='text-foreground/80'>{profile?.short_bio}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
      <div className='flex items-center justify-between mb-8'>
        <div className='flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0'>
          <label className='cursor-pointer'>
            <Input
              type='file'
              className='hidden'
              onChange={handleAvatarUpload}
              accept='image/*'
            />
            <Button variant='outline' size='sm' asChild>
              <span>
                <Upload className='h-4 w-4 mr-2' />
                Update Avatar
              </span>
            </Button>
          </label>
          {editMode ? (
            <Button variant='default' size='sm' onClick={handleUpdateProfile}>
              Save
            </Button>
          ) : (
            <Button
              variant='secondary'
              size='sm'
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </Button>
          )}
        </div>
        <div className='flex flex-col items-end space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0'>
          <Link href='/trips'>
            <Button variant='outline'>View All Trips</Button>
          </Link>
          <Link href='/logbook'>
            <Button>New Trip</Button>
          </Link>
        </div>
      </div>

      <FishingStatistics userId={user.id} />
    </main>
  );
}
