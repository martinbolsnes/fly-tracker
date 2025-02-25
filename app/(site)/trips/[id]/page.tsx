'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Calendar,
  CloudSunRain,
  Clock,
  Info,
  Sun,
  CloudRain,
  Droplet,
  ThermometerSun,
  ThermometerSnowflake,
  MoonStar,
  Cloudy,
  CloudSnow,
  CloudDrizzle,
  CloudFog,
  CloudSun,
} from 'lucide-react';
import Image from 'next/image';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { GiFishingPole } from 'react-icons/gi';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Separator } from '@/components/ui/separator';
import { FishingTrip } from '@/app/types';

export const calculateFultonFactor = (
  length: number,
  weight: number
): number => {
  return (weight / Math.pow(length, 3)) * 100;
};

export default function TripPage() {
  const params = useParams();
  const [trip, setTrip] = useState<FishingTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchTripData() {
      try {
        const { data: tripData, error: tripError } = await supabase
          .from('fishing_trips')
          .select('*')
          .eq('id', params.id)
          .single();

        if (tripError) throw tripError;

        const { data: catchesData, error: catchesError } = await supabase
          .from('fish_catches')
          .select('*')
          .eq('trip_id', params.id);

        if (catchesError) throw catchesError;

        setTrip({ ...tripData, fish_catches: catchesData });
      } catch (err) {
        console.error('Error fetching trip data:', err);
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred'
        );
      } finally {
        setLoading(false);
      }
    }

    fetchTripData();
  }, [params.id, supabase]);

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <LoadingSpinner fill='fill-primary' />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Card className='w-full max-w-md'>
          <CardContent className='flex flex-col items-center p-6'>
            <h1 className='text-2xl font-bold text-red-500 mb-4'>Error</h1>
            <p className='text-center'>{error || 'Trip not found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='w-full max-w-6xl container px-4 py-8'>
      <Link href='/trips'>
        <Button variant='outline' className='mb-4'>
          Back to all trips
        </Button>
      </Link>
      <Card className='flex flex-col overflow-hidden border border-border'>
        <div className='relative'>
          {trip.image_url ? (
            <AspectRatio ratio={16 / 9}>
              <Image
                src={trip.image_url || '/placeholder.svg'}
                alt={`Trip to ${trip.location}`}
                fill
                priority
                sizes='100vw'
                quality={100}
                className='object-cover w-full h-full'
              />
            </AspectRatio>
          ) : (
            <AspectRatio ratio={16 / 9}>
              <div className='flex items-center justify-center h-full bg-background'>
                <GiFishingPole color='primary' className='w-12 h-12' />
              </div>
            </AspectRatio>
          )}
          <div className='absolute top-10 right-2'>
            <Badge variant='secondary'>
              <MapPin className='h-3 w-3 mr-1' />
              {trip.location}
            </Badge>
          </div>
          <div className='absolute top-2 right-2'>
            <Badge variant='secondary'>
              <Calendar className='h-3 w-3 mr-1' />
              {new Date(trip.date).toLocaleDateString()}
            </Badge>
          </div>
        </div>
        <CardContent className='space-y-6'>
          <div className='grid sm:grid-cols-4 grid-cols-1 gap-4 mt-4'>
            <div className='sm:col-span-2 space-y-4'>
              <h3 className='text-lg font-semibold mb-2'>Trip Info</h3>
              <div className='flex items-center space-x-2'>
                {trip.weather === 'Sunny' ? (
                  <Sun className='h-4 w-4 mr-2 text-primary' />
                ) : trip.weather === 'Rainy' ? (
                  <CloudRain className='h-4 w-4 mr-2 text-primary' />
                ) : trip.weather === 'Cloudy' ? (
                  <CloudSun className='h-4 w-4 mr-2 text-primary' />
                ) : trip.weather === 'Overcast' ? (
                  <Cloudy className='h-4 w-4 mr-2 text-primary' />
                ) : trip.weather === 'Clear' ? (
                  <MoonStar className='h-4 w-4 mr-2 text-primary' />
                ) : trip.weather === 'Snowy' ? (
                  <CloudSnow className='h-4 w-4 mr-2 text-primary' />
                ) : trip.weather === 'Drizzly' ? (
                  <CloudDrizzle className='h-4 w-4 mr-2 text-primary' />
                ) : trip.weather === 'Foggy' ? (
                  <CloudFog className='h-4 w-4 mr-2 text-primary' />
                ) : (
                  <CloudSunRain className='h-4 w-4 mr-2 text-primary' />
                )}
                {trip.weather}
              </div>
              <div className='flex items-center space-x-2'>
                <Clock className='h-4 w-4 text-primary' />
                <span>{trip.time_of_day}</span>
              </div>
              <div className='flex items-center space-x-2'>
                {trip.water_temperature && (
                  <div className='flex items-center'>
                    <Droplet className='h-4 w-4 mr-2 text-primary' />
                    {trip.water_temperature}°C
                  </div>
                )}
                {trip.air_temperature && (
                  <div className='flex items-center'>
                    {trip.air_temperature < 10 ? (
                      <ThermometerSnowflake className='h-4 w-4 mr-2 text-primary' />
                    ) : (
                      <ThermometerSun className='h-4 w-4 mr-2 text-primary' />
                    )}
                    {trip.air_temperature}°C
                  </div>
                )}
              </div>
              {trip.notes && (
                <div>
                  <h4 className='text-md font-semibold mb-2'>Notes</h4>
                  <p className='text-muted-foreground'>{trip.notes}</p>
                </div>
              )}
            </div>

            {trip.fish_catches.length > 0 && (
              <div className='sm:col-span-2 grid-cols-1'>
                <h3 className='text-lg font-semibold mb-2'>Catches</h3>
                <div className='space-y-4'>
                  {trip.fish_catches.map((fishCatch) => (
                    <div key={fishCatch.id}>
                      <div className='flex justify-between items-center'>
                        <h4 className='text-lg'>{fishCatch.fish_type}</h4>
                        <Badge variant='secondary'>{fishCatch.caught_on}</Badge>
                      </div>
                      {fishCatch.length && fishCatch.weight && (
                        <div className='mt-2 grid grid-cols-2 gap-2'>
                          <div>Length: {fishCatch.length} cm</div>
                          <div>
                            Weight:{' '}
                            {fishCatch.weight >= 1000
                              ? (fishCatch.weight / 1000).toFixed(2) + ' kg'
                              : fishCatch.weight + ' g'}
                          </div>
                          {(fishCatch.fish_type
                            .toLowerCase()
                            .includes('trout') ||
                            fishCatch.fish_type
                              .toLowerCase()
                              .includes('ørret')) && (
                            <div className='col-span-2 flex items-center'>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Info className='w-4 h-4 mr-2 cursor-pointer' />
                                </PopoverTrigger>
                                <PopoverContent className='border border-border'>
                                  <p>
                                    Fulton&apos;s K factor is a measure of the
                                    condition of the fish. The Fulton&apos;s K =
                                    (W / L^3) * 100, where W is the weight of
                                    the fish in grams and L is the length of the
                                    fish in cm. A healthy fish will have a K
                                    factor between 1 and 1.1.
                                  </p>
                                </PopoverContent>
                              </Popover>
                              K Factor:{' '}
                              {calculateFultonFactor(
                                fishCatch.length,
                                fishCatch.weight
                              ).toFixed(2)}
                            </div>
                          )}
                          {(fishCatch.fish_type
                            .toLowerCase()
                            .includes('trout') ||
                            fishCatch.fish_type
                              .toLowerCase()
                              .includes('ørret')) && (
                            <div>
                              <Badge
                                variant='secondary'
                                className={`${
                                  calculateFultonFactor(
                                    fishCatch.length,
                                    fishCatch.weight
                                  ) < 0.9
                                    ? 'bg-red-500 text-white hover:bg-red-500'
                                    : calculateFultonFactor(
                                        fishCatch.length,
                                        fishCatch.weight
                                      ) < 0.95
                                    ? 'bg-neutral-500 text-white hover:bg-neutral-500'
                                    : calculateFultonFactor(
                                        fishCatch.length,
                                        fishCatch.weight
                                      ) < 1.06
                                    ? 'bg-green-600 text-white hover:bg-green-600'
                                    : calculateFultonFactor(
                                        fishCatch.length,
                                        fishCatch.weight
                                      ) < 1.16
                                    ? 'bg-green-500 text-white hover:bg-green-500'
                                    : 'bg-red-400 text-black hover:bg-red-400'
                                }`}
                              >
                                {calculateFultonFactor(
                                  fishCatch.length,
                                  fishCatch.weight
                                ) < 0.91
                                  ? 'Underweight'
                                  : calculateFultonFactor(
                                      fishCatch.length,
                                      fishCatch.weight
                                    ) < 0.96
                                  ? 'Average'
                                  : calculateFultonFactor(
                                      fishCatch.length,
                                      fishCatch.weight
                                    ) < 1.06
                                  ? 'Healthy'
                                  : calculateFultonFactor(
                                      fishCatch.length,
                                      fishCatch.weight
                                    ) < 1.16
                                  ? 'Very Healthy'
                                  : 'Overweight'}
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                      <Separator className='mt-2' />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
