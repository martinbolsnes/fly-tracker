import { FishSymbol } from 'lucide-react';
import Link from 'next/link';
import { GiFishingPole } from 'react-icons/gi';

export default function Footer() {
  return (
    <footer className='bg-background py-8 border-t border-border'>
      <div className='container mx-auto px-4'>
        <div className='flex flex-col md:flex-row justify-between items-center'>
          {/* <div className='flex items-center space-x-2 mb-4 md:mb-0'>
            <GiFishingPole color='primary' className='w-6 h-6' />
            <span className='text-xl'>FlyTracker</span>
          </div> */}
          {/* <div className='flex space-x-4'>
            <Link href='/about' className='hover:text-slate-300'>
              About
            </Link>
            <Link href='/privacy' className='hover:text-slate-300'>
              Privacy Policy
            </Link>
            <Link href='/terms' className='hover:text-slate-300'>
              Terms of Service
            </Link>
            <Link href='/contact' className='hover:text-slate-300'>
              Contact
            </Link>
          </div> */}
        </div>
        <div className='mt-4 text-center text-sm text-foreground/60'>
          © {new Date().getFullYear()} The Catch Chronicles. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
