'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FishSymbol, Clock, Scale, Calendar, MapPin } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
} from 'recharts';

type FishCatch = {
  fish_type: string;
  caught_on: string;
  length: number;
  weight: number;
};

type FishingTrip = {
  id: string;
  date: string;
  location: string;
  time_of_day: string;
  weather: string;
  fish_catches: FishCatch[];
};

export function FishingStatistics({ userId }: { userId: string }) {
  const [trips, setTrips] = useState<FishingTrip[]>([]);
  const [stats, setStats] = useState<{
    avgLength: number;
    avgWeight: number;
    mostUsedFly: string;
    mostCommonFish: string;
    bestFishingTime: string;
    bestWeather: string;
    largestFish: { type: string; length: number; weight: number };
    totalWeight: number;
    totalCatches: number;
    totalTrips: number;
    favoriteLocation: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data: trips, error } = await supabase
          .from('fishing_trips')
          .select('*')
          .eq('user_id', userId);

        if (error) {
          console.error('Error fetching trips:', error);
          throw new Error('Error fetching trips');
        }

        const tripsWithCatches = await Promise.all(
          (trips || []).map(async (trip) => {
            const { data: catchesData, error: catchesError } = await supabase
              .from('fish_catches')
              .select('*')
              .eq('trip_id', trip.id);
            if (catchesError) {
              console.error('Error fetching catches:', catchesError);
              throw new Error('Error fetching catches');
            }
            return { ...trip, fish_catches: catchesData || [] };
          })
        );
        setTrips(tripsWithCatches);

        const allCatches = tripsWithCatches.flatMap(
          (trip: FishingTrip) => trip.fish_catches || []
        );

        const avgLength =
          allCatches.reduce((sum, fish) => sum + (fish.length || 0), 0) /
          (allCatches.length || 1);
        const avgWeight =
          allCatches.reduce((sum, fish) => sum + (fish.weight || 0), 0) /
          (allCatches.length || 1);

        const flyCounts = allCatches.reduce((acc, fish) => {
          acc[fish.caught_on] = (acc[fish.caught_on] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const mostUsedFly =
          Object.entries(flyCounts).sort(
            (a, b) => (b[1] as number) - (a[1] as number)
          )[0]?.[0] || 'N/A';

        const fishCounts = allCatches.reduce((acc, fish) => {
          acc[fish.fish_type] = (acc[fish.fish_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const mostCommonFish =
          Object.entries(fishCounts).sort(
            (a, b) => (b[1] as number) - (a[1] as number)
          )[0]?.[0] || 'N/A';

        const timeCounts = tripsWithCatches.reduce((acc, trip) => {
          acc[trip.time_of_day] =
            (acc[trip.time_of_day] || 0) + (trip.fish_catches?.length || 0);
          return acc;
        }, {} as Record<string, number>);
        const bestFishingTime =
          Object.entries(timeCounts).sort(
            (a, b) => (b[1] as number) - (a[1] as number)
          )[0]?.[0] || 'N/A';

        const weatherCounts = tripsWithCatches.reduce((acc, trip) => {
          acc[trip.weather] =
            (acc[trip.weather] || 0) + (trip.fish_catches?.length || 0);
          return acc;
        }, {} as Record<string, number>);
        const bestWeather =
          Object.entries(weatherCounts).sort(
            (a, b) => (b[1] as number) - (a[1] as number)
          )[0]?.[0] || 'N/A';

        const locationCounts = tripsWithCatches.reduce((acc, trip) => {
          acc[trip.location] = (acc[trip.location] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const favoriteLocation =
          Object.entries(locationCounts).sort(
            (a, b) => (b[1] as number) - (a[1] as number)
          )[0]?.[0] || 'N/A';

        const largestFish = allCatches.reduce(
          (largest, fish) =>
            fish.length > (largest?.length || 0) ? fish : largest,
          allCatches[0]
        );

        const totalWeight = allCatches.reduce(
          (sum, fish) => sum + (fish.weight || 0),
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
            type: largestFish?.fish_type || 'N/A',
            length: largestFish?.length || 0,
            weight: largestFish?.weight || 0,
          },
          totalWeight,
          totalCatches: allCatches.length,
          totalTrips: tripsWithCatches.length,
          favoriteLocation,
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
    return (
      <div>
        <LoadingSpinner fill='fill-primary' />
      </div>
    );
  }

  if (!stats) {
    return <div>No fishing statistics available.</div>;
  }

  const chartData = Object.entries(
    trips.reduce((acc, trip) => {
      const fishList = trip.fish_catches.map((fish) => fish.fish_type.trim());
      fishList.forEach((fish) => {
        const [species] = fish.split(' ');
        acc[species] = (acc[species] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>)
  )
    .filter(([name]) => name !== 'No catch')
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const pieChartData = Object.entries(
    trips.reduce((acc, trip) => {
      acc[trip.location] = (acc[trip.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const lineChartData = Object.entries(
    trips
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .reduce((acc, trip) => {
        const date = new Date(trip.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
        });
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
  ).map(([date, count]) => ({
    date,
    count,
  }));

  return (
    <>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
        <Card className='bg-card border border-border'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-normal tracking-tight'>
              Total Trips
            </CardTitle>
            <Calendar className='h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalTrips}</div>
          </CardContent>
        </Card>
        <Card className='bg-card border border-border'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-normal tracking-tight'>
              Total Catches
            </CardTitle>
            <FishSymbol className='h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalCatches}</div>
          </CardContent>
        </Card>
        <Card className='bg-card border border-border'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-normal tracking-tight'>
              Favorite Location
            </CardTitle>
            <MapPin className='h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats.favoriteLocation || 'No data'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-8'>
        <Card className='bg-card border border-border'>
          <CardHeader>
            <CardTitle className='text-md font-normal tracking-tight'>
              Top 5 Fish Species Caught
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: 'Count',
                  color: 'hsl(var(--primary))',
                },
              }}
              className='container mx-auto h-[300px]'
            >
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey='name'
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey='value' fill='hsl(var(--primary))' radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className='bg-card border border-border'>
          <CardHeader>
            <CardTitle className='text-md font-normal tracking-tight'>
              Top 5 Fishing Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: 'Count',
                  color: 'hsl(var(--primary))',
                },
              }}
              className='container mx-auto h-[300px]'
            >
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  outerRadius={80}
                  fill='hsl(var(--primary))'
                  dataKey='value'
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                    />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className='bg-card border border-border'>
        <CardHeader>
          <CardTitle className='text-md font-normal tracking-tight'>
            Fishing Trips Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              count: {
                label: 'Trip Count',
                color: 'hsl(var(--primary))',
              },
            }}
            className='container mx-auto h-[300px]'
          >
            <LineChart
              data={lineChartData}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray='3 3' vertical={false} />
              <XAxis
                dataKey='date'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type='monotone'
                dataKey='count'
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: 'hsl(var(--primary))',
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

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
    </>
  );
}
