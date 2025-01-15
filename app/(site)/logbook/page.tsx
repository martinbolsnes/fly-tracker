import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AddNewTrip from '../../components/add-new-trip';

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    redirect('/login');
  }

  return (
    <main className='container mx-auto max-w-3xl px-4 py-8'>
      <div>
        <AddNewTrip />
      </div>
    </main>
  );
}
