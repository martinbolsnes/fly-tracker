import { createClient } from '../../lib/supabase/server';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import Avatar from './Avatar';
import LogoutButton from './Logout/Logout';
import ThemeToggle from './themeToggle';

export const Header = async () => {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  return (
    <header
      className={cn(
        'bg-background/95 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-10'
      )}
    >
      <div>
        <Link href='/'>
          <p className={cn(`text-lg sm:text-xl font-bold -mb-2`)}>
            <span className='text-base text-primary'>The</span> Catch
            <br />
          </p>

          <p className={cn(`text-lg sm:text-xl font-bold`)}>Chronicles</p>
        </Link>
      </div>
      <div className={cn('flex items-center gap-4')}>
        <ThemeToggle />
        {user ? (
          <Avatar />
        ) : (
          <Link href='/login'>
            <Button variant='outline' className='font-semibold'>
              Log in
            </Button>
          </Link>
        )}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant='ghost'>
              <Menu className={cn('w-6 h-6')} />
            </Button>
          </SheetTrigger>
          <SheetContent className={cn('bg-background/95 border border-border')}>
            <SheetHeader className={cn('flex')}>
              <SheetTitle>
                <Link href='/'>
                  <p className={cn(`text-md sm:text-lg font-bold -mb-2`)}>
                    <span className='text-xs text-primary'>The</span> Catch
                    <br />
                  </p>

                  <p className={cn(`text-md sm:text-lg font-bold`)}>
                    Chronicles
                  </p>
                </Link>
              </SheetTitle>
            </SheetHeader>
            <div className={cn('flex flex-col items-end gap-4 py-6 text-lg')}>
              <Link href='/'>
                <Button variant='ghost' className='font-semibold'>
                  Home
                </Button>
              </Link>
              <Link href='/about'>
                <Button variant='ghost' className='font-semibold'>
                  About
                </Button>
              </Link>
              <>
                <Separator />
                {user ? (
                  <>
                    <SheetTrigger asChild>
                      <Link href='/profile'>
                        <Button variant='ghost' className='font-semibold'>
                          Profile
                        </Button>
                      </Link>
                    </SheetTrigger>
                    <SheetTrigger asChild>
                      <Link href='/trips'>
                        <Button variant='ghost' className='font-semibold'>
                          Your trips
                        </Button>
                      </Link>
                    </SheetTrigger>
                    <SheetTrigger asChild>
                      <Link href='/logbook'>
                        <Button variant='ghost' className='font-semibold'>
                          Log new trip
                        </Button>
                      </Link>
                    </SheetTrigger>
                    <Separator />
                    <SheetTrigger asChild>
                      <LogoutButton />
                    </SheetTrigger>
                  </>
                ) : (
                  <Link href='/login'>
                    <Button variant='outline' className='font-semibold'>
                      Log in
                    </Button>
                  </Link>
                )}
              </>
            </div>
            <SheetFooter></SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
