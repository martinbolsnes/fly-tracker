import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProfileCard from '@/app/components/profile/ProfileCard';
import { FishingStatistics } from '@/app/components/stastistics';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

async function getProfileData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return { user, profile };
}

export default async function ProfilePage() {
  const data = await getProfileData();

  if (!data) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <p className='text-red-500'>
          Error loading profile. Please try again later.
        </p>
      </div>
    );
  }

  const { user, profile } = data;

  return (
    <>
      <main className='container mx-auto px-4 py-8 bg-background'>
        <Suspense fallback={<LoadingSpinner />}>
          <ProfileCard initialProfile={profile} userId={user.id} />
        </Suspense>
        <div className='flex justify-end space-x-2'>
          <Link href='/trips'>
            <Button variant='outline' size='sm'>
              View All Trips
            </Button>
          </Link>
          <Link href='/logbook'>
            <Button variant='default' size='sm'>
              Log New Trip
            </Button>
          </Link>
        </div>
        <Suspense fallback={<LoadingSpinner />}>
          <FishingStatistics userId={user.id} />
        </Suspense>
      </main>
    </>
  );
}
