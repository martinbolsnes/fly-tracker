'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function CookieInfo() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenCookieInfo = localStorage.getItem('hasSeenCookieInfo');
    if (!hasSeenCookieInfo) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenCookieInfo', 'true');
  };

  if (!isVisible) return null;

  return (
    <Card className='fixed bottom-0 right-0 border border-border'>
      <CardContent className='container mx-auto flex items-center justify-between p-2'>
        <p className='text-sm'>
          We use strictly essential cookies to ensure the basic functionality of
          this app and improve your experience. By continuing to use this site,
          you agree to our use of cookies. Learn more in our{' '}
          <Link href='/privacy-policy' className='text-primary hover:underline'>
            Privacy Policy
          </Link>
          .
        </p>
        <Button variant='outline' className='ml-4' onClick={handleClose}>
          <X size={18} />
        </Button>
      </CardContent>
    </Card>
  );
}
