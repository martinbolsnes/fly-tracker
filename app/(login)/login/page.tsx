'use client';

import { Fish } from 'lucide-react';
/* import LoginButtonGithub from '@/app/components/Login/LoginGithub'; */
import LoginButtonGoogle from '@/app/components/Login/LoginGoogle';
import { cn } from '@/lib/utils';
import { GiFishingPole } from 'react-icons/gi';

export default function LoginPage() {
  return (
    <div className={cn('container mx-auto max-w-md space-y-6 py-12 w-full')}>
      <div className={cn('space-y-2 text-center')}>
        <h1
          className={cn(
            'text-4xl font-medium font-urbanist flex items-center justify-center pb-4'
          )}
        >
          <GiFishingPole color='primary' className='w-8 h-8 mr-4' />
          FlyTracker
        </h1>
        <p className={cn('text-foreground/60')}>
          If this is your first time logging in, a user will be created for you.
        </p>
      </div>
      <LoginButtonGoogle />
      {/* <LoginButtonGithub /> */}
    </div>
  );
}
