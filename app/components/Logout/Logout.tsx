'use client';

import { Button } from '@/components/ui/button';
import { createClient } from '../../../lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LoadingSpinner } from '../LoadingSpinner';

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    router.refresh();
  };

  return (
    <Button
      variant='outline'
      className='border-rose-500 font-semibold'
      onClick={handleLogout}
    >
      {loading ? <LoadingSpinner fill='fill-rose-500' /> : 'Log out'}
    </Button>
  );
}
