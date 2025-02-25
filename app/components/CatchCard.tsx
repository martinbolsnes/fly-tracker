'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LoadingSpinner } from './LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { GiFishingPole } from 'react-icons/gi';
import { Badge } from '@/components/ui/badge';
import { Calendar, Info, MapPin, Ruler, Weight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateFultonFactor } from '../(site)/trips/[id]/page';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Catch {
  id: number;
  trip_id: number;
  fish_type: string;
  caught_on: string;
  length: number;
  weight: number;
  fishing_trips: {
    location: string;
    date: string;
    image_url?: string;
  };
}

interface CatchCardProps {
  initialCatches: Catch[];
  userId: string;
}

export default function CatchCard({ initialCatches, userId }: CatchCardProps) {
  const [catches, setCatches] = useState<Catch[]>(initialCatches);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCatches = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data: catches, error: catchesError } = await supabase
        .from('fish_catches')
        .select(
          `
          *,
          fishing_trips (
            location,
            date,
            image_url
          )
        `
        )
        .eq('fishing_trips.user_id', userId);

      if (catchesError) {
        console.error('Error fetching catches:', catchesError);
        setLoading(false);
        return;
      }

      setCatches(catches);
      setLoading(false);
    };

    fetchCatches();
  }, [userId]);

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
      {catches.map((catchItem) => (
        <Card
          key={catchItem.id}
          className='flex flex-col overflow-hidden border border-border'
        >
          <div className='relative h-48'>
            {catchItem.fishing_trips.image_url ? (
              <Image
                src={catchItem.fishing_trips.image_url || '/placeholder.svg'}
                alt={`Trip to ${catchItem.fishing_trips.location}`}
                fill
                priority
                sizes='50vw'
                className='object-cover w-full h-full'
              />
            ) : (
              <div className='flex items-center justify-center h-full bg-background'>
                <GiFishingPole color='primary' className='w-12 h-12' />
              </div>
            )}
          </div>
          <div className='p-4'>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle>{catchItem.fish_type}</CardTitle>
              <Link href={`/trips/${catchItem.trip_id}`}>
                <Button variant='outline' size='sm' className='mt-auto'>
                  View trip
                </Button>
              </Link>
            </CardHeader>
            <CardContent className='flex-grow'>
              <Badge variant='default'>{catchItem.caught_on}</Badge>
              <div className='grid grid-cols-2 gap-2 text-sm mt-4'>
                <div className='flex items-center'>
                  <MapPin className='h-4 w-4 mr-2 text-primary' />
                  {catchItem.fishing_trips.location}
                </div>
                <div className='flex items-center'>
                  <Calendar className='h-4 w-4 mr-2 text-primary' />
                  {new Date(catchItem.fishing_trips.date).toLocaleDateString()}
                </div>
                <div className='flex items-center'>
                  <Ruler className='h-4 w-4 mr-2 text-primary' />
                  {catchItem.length} cm
                </div>
                <div className='flex items-center'>
                  <Weight className='h-4 w-4 mr-2 text-primary' />{' '}
                  {catchItem.weight} g
                </div>
                {(catchItem.fish_type.toLowerCase().includes('trout') ||
                  catchItem.fish_type.toLowerCase().includes('ørret')) && (
                  <div className='col-span-2 flex items-center mt-4'>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Info className='w-4 h-4 mr-2 cursor-pointer' />
                      </PopoverTrigger>
                      <PopoverContent className='border border-border'>
                        <p>
                          Fulton&apos;s K factor is a measure of the condition
                          of the fish. The Fulton&apos;s K = (W / L^3) * 100,
                          where W is the weight of the fish in grams and L is
                          the length of the fish in cm. A healthy fish will have
                          a K factor between 1 and 1.1.
                        </p>
                      </PopoverContent>
                    </Popover>
                    K Factor:{' '}
                    {calculateFultonFactor(
                      catchItem.length,
                      catchItem.weight
                    ).toFixed(2)}
                  </div>
                )}
                {(catchItem.fish_type.toLowerCase().includes('trout') ||
                  catchItem.fish_type.toLowerCase().includes('ørret')) && (
                  <div>
                    <Badge
                      variant='secondary'
                      className={`${
                        calculateFultonFactor(
                          catchItem.length,
                          catchItem.weight
                        ) < 0.9
                          ? 'bg-red-500 text-white hover:bg-red-500'
                          : calculateFultonFactor(
                              catchItem.length,
                              catchItem.weight
                            ) < 0.95
                          ? 'bg-neutral-500 text-white hover:bg-neutral-500'
                          : calculateFultonFactor(
                              catchItem.length,
                              catchItem.weight
                            ) < 1.06
                          ? 'bg-green-600 text-white hover:bg-green-600'
                          : calculateFultonFactor(
                              catchItem.length,
                              catchItem.weight
                            ) < 1.16
                          ? 'bg-green-500 text-white hover:bg-green-500'
                          : 'bg-red-400 text-black hover:bg-red-400'
                      }`}
                    >
                      {calculateFultonFactor(
                        catchItem.length,
                        catchItem.weight
                      ) < 0.91
                        ? 'Underweight'
                        : calculateFultonFactor(
                            catchItem.length,
                            catchItem.weight
                          ) < 0.96
                        ? 'Average'
                        : calculateFultonFactor(
                            catchItem.length,
                            catchItem.weight
                          ) < 1.06
                        ? 'Healthy'
                        : calculateFultonFactor(
                            catchItem.length,
                            catchItem.weight
                          ) < 1.16
                        ? 'Very Healthy'
                        : 'Overweight'}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
}
