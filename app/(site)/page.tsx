import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FishSymbol, MapPin, BarChart2, CloudSunRain } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return (
    <div className='h-min-svh flex flex-col bg-background'>
      <main className='container mx-auto px-4 py-16'>
        <div className='text-center mb-16'>
          <h1 className='text-5xl font-bold mb-4 text-foreground'>
            Track Your Fly Fishing Adventures
          </h1>
          <p className='text-xl mb-8 text-foreground/80'>
            Record catches, analyze patterns, and become a better angler with
            FlyFish Logbook
          </p>

          <Button size='lg' asChild variant='default'>
            {!user ? (
              <Link href='/login'>Get Started Now</Link>
            ) : (
              <Link href='/profile'>Get Started Now</Link>
            )}
          </Button>
        </div>

        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16'>
          <Card className='rounded-xl border border-border bg-card text-card-foreground shadow'>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <FishSymbol className='h-5 w-5' />
                <span>Log Catches</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className='text-card-foreground/80'>
                Record species, size, and photos of your catches
              </CardDescription>
            </CardContent>
          </Card>
          <Card className='rounded-xl border border-border bg-card text-card-foreground shadow'>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <MapPin className='h-5 w-5 ' />
                <span>Track Locations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className='text-card-foreground/80'>
                Save your favorite fishing spots and discover new ones
              </CardDescription>
            </CardContent>
          </Card>
          <Card className='rounded-xl border border-border bg-card text-card-foreground shadow'>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2 '>
                <CloudSunRain className='h-5 w-5 ' />
                <span>Weather Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className='text-card-foreground/80'>
                Correlate catches with weather conditions for better planning
              </CardDescription>
            </CardContent>
          </Card>
          <Card className='rounded-xl border border-border bg-card text-card-foreground shadow'>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2 '>
                <BarChart2 className='h-5 w-5 ' />
                <span>Analyze Trends</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className='text-card-foreground/80'>
                Visualize your fishing patterns and improve your strategy
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
