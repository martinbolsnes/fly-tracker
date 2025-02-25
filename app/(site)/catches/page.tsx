import CatchCard from '@/app/components/CatchCard';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

async function getCatches() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: trips, error: tripsError } = await supabase
    .from('fishing_trips')
    .select('id')
    .eq('user_id', user.id);

  if (tripsError) {
    console.error('Error fetching trips:', tripsError);
    return null;
  }

  if (trips && trips.length > 0) {
    const tripIds = trips.map((trip) => trip.id);

    const { data: catches, error: catchesError } = await supabase
      .from('fish_catches')
      .select(
        `
        *,
        fishing_trips (
          location,
          date,
          image_url
        )
      `
      )
      .in('trip_id', tripIds);

    if (catchesError) {
      console.error('Error fetching catches:', catchesError);
      return null;
    }

    return { user, catches };
  }

  return { user, catches: [] };
}

export default async function CatchesPage() {
  const data = await getCatches();

  if (!data) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <p className='text-red-500'>
          Error loading catches. Please try again later.
        </p>
      </div>
    );
  }

  const { user, catches } = data;

  return (
    <>
      <main className='container mx-auto px-4 py-8 bg-background'>
        <h1 className='text-3xl font-bold mb-6'>Catches</h1>
        <div>
          <Suspense fallback={<LoadingSpinner />}>
            <CatchCard initialCatches={catches} userId={user.id} />
          </Suspense>
        </div>
      </main>
    </>
  );
}
