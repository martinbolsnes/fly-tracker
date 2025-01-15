'use client';

import { UtensilsIcon } from 'lucide-react';
import LoginButtonGithub from '@/app/components/Login/LoginGithub';
import LoginButtonGoogle from '@/app/components/Login/LoginGoogle';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  return (
    <div className={cn('container mx-auto max-w-md space-y-6 py-12 w-full')}>
      <div className={cn('space-y-2 text-center')}>
        <h1
          className={cn(
            'text-4xl font-medium font-urbanist flex items-center justify-center pb-4'
          )}
        >
          <UtensilsIcon className={cn('mr-2 h-6 w-6')} />
          munchmate
        </h1>
        <p className={cn('text-foreground/60')}>
          Hvis dette er første gang du logger inn, vil en bruker bli opprettet
          for deg.
        </p>
      </div>
      <LoginButtonGoogle />
      <LoginButtonGithub />
    </div>
  );
}
