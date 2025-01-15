import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CircleUser } from 'lucide-react';

export default async function AvatarComponent() {
  const supabase = await createClient();
  const { data: user, error } = await supabase.auth.getUser();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href='/profile'>
            <Avatar className='w-6 h-6'>
              <AvatarImage
                src={user.user?.user_metadata?.avatar_url}
                alt='User avatar'
              />
              <AvatarFallback>
                <CircleUser strokeWidth={2} />
              </AvatarFallback>
            </Avatar>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>Profile</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
