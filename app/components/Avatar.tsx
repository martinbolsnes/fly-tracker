'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CircleUser } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AvatarComponent() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvatar = async () => {
      const supabase = createClient();
      const { data: user } = await supabase.auth.getUser();
      const userId = user?.user?.id;
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching avatar:', error);
      } else {
        setAvatarUrl(data.avatar_url || null);
      }
    };

    fetchAvatar();
  }, []);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href='/profile'>
            <Avatar className='w-6 h-6'>
              <AvatarImage src={avatarUrl ?? ''} alt='User avatar' />
              <AvatarFallback>
                <CircleUser strokeWidth={2} />
              </AvatarFallback>
            </Avatar>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <span>Profile</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
