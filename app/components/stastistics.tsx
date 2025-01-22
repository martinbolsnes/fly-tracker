'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FishSymbol, Clock, Scale } from 'lucide-react';

type FishCatch = {
  fish_type: string;
  caught_on: string;
  length: number;
  weight: number;
};

type FishingTrip = {
  id: string;
  time_of_day: string;
  weather: string;
  fish_catches: FishCatch[];
};

export function FishingStatistics({ userId }: { userId: string }) {
  const [stats, setStats] = useState<{
    avgLength: number;
    avgWeight: number;
    mostUsedFly: string;
    mostCommonFish: string;
    bestFishingTime: string;
    bestWeather: string;
    largestFish: { type: string; length: number; weight: number };
    totalWeight: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data: trips, error } = await supabase
          .from('fishing_trips')
          .select('id, time_of_day, weather, fish_catches(*)')
          .eq('user_id', userId);

        if (error) throw error;

        const allCatches = trips.flatMap(
          (trip: FishingTrip) => trip.fish_catches
        );

        const avgLength =
          allCatches.reduce((sum, fish) => sum + fish.length, 0) /
          allCatches.length;
        const avgWeight =
          allCatches.reduce((sum, fish) => sum + fish.weight, 0) /
          allCatches.length;

        const flyCounts = allCatches.reduce((acc, fish) => {
          acc[fish.caught_on] = (acc[fish.caught_on] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const mostUsedFly = Object.entries(flyCounts).sort(
          (a, b) => b[1] - a[1]
        )[0][0];

        const fishCounts = allCatches.reduce((acc, fish) => {
          acc[fish.fish_type] = (acc[fish.fish_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const mostCommonFish = Object.entries(fishCounts).sort(
          (a, b) => b[1] - a[1]
        )[0][0];

        const timeCounts = trips.reduce((acc, trip) => {
          acc[trip.time_of_day] =
            (acc[trip.time_of_day] || 0) + trip.fish_catches.length;
          return acc;
        }, {} as Record<string, number>);
        const bestFishingTime = Object.entries(timeCounts).sort(
          (a, b) => b[1] - a[1]
        )[0][0];

        const weatherCounts = trips.reduce((acc, trip) => {
          acc[trip.weather] =
            (acc[trip.weather] || 0) + trip.fish_catches.length;
          return acc;
        }, {} as Record<string, number>);
        const bestWeather = Object.entries(weatherCounts).sort(
          (a, b) => b[1] - a[1]
        )[0][0];

        const largestFish = allCatches.reduce(
          (largest, fish) =>
            fish.length > (largest?.length || 0) ? fish : largest,
          allCatches[0]
        );

        const totalWeight = allCatches.reduce(
          (sum, fish) => sum + fish.weight,
          0
        );

        setStats({
          avgLength,
          avgWeight,
          mostUsedFly,
          mostCommonFish,
          bestFishingTime,
          bestWeather,
          largestFish: {
            type: largestFish.fish_type,
            length: largestFish.length,
            weight: largestFish.weight,
          },
          totalWeight,
        });
      } catch (error) {
        console.error('Error fetching fishing stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [userId, supabase]);

  if (loading) {
    return <div>Loading statistics...</div>;
  }

  if (!stats) {
    return <div>No fishing statistics available.</div>;
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-8'>
      <Card className='border border-border'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Avg Fish Size</CardTitle>
          <FishSymbol className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {stats.avgLength.toFixed(1)} cm
          </div>
          <p className='text-xs text-muted-foreground'>
            Avg weight: {stats.avgWeight.toFixed(1)} g
          </p>
        </CardContent>
      </Card>
      <Card className='border border-border'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Most Used Fly</CardTitle>
          <FishSymbol className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.mostUsedFly}</div>
          <p className='text-xs text-muted-foreground'>
            Most common fish: {stats.mostCommonFish}
          </p>
        </CardContent>
      </Card>
      <Card className='border border-border'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Best Fishing Time
          </CardTitle>
          <Clock className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.bestFishingTime}</div>
          <p className='text-xs text-muted-foreground'>
            Best weather: {stats.bestWeather}
          </p>
        </CardContent>
      </Card>
      <Card className='border border-border'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Largest Fish</CardTitle>
          <Scale className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.largestFish.type}</div>
          <p className='text-xs text-muted-foreground'>
            {stats.largestFish.length} cm, {stats.largestFish.weight} g
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
