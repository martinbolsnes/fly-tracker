import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ErrorPage() {
  return (
    <div className='flex flex-col items-center justify-center space-y-4'>
      <h1 className='text-lg font-semibold'>Oops... 😬</h1>
      <p className='text-foreground'>Something went wrong</p>
      <Link href='/'>
        <Button variant='outline'>Go back home</Button>
      </Link>
    </div>
  );
}
