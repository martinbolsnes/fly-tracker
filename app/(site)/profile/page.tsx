'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { FishSymbol, MapPin, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Bar,
  BarChart,
  XAxis,
  Pie,
  PieChart,
  Cell,
  Legend,
  Line,
  LineChart,
  CartesianGrid,
} from 'recharts';

type FishingTrip = {
  id: string;
  user_id: string;
  date: string;
  location: string;
  fish_caught: string;
};

export default function ProfilePage() {
  const [trips, setTrips] = useState<FishingTrip[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndTrips = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data, error } = await supabase
          .from('fishing_trips')
          .select('*')
          .eq('user_id', user.id);
        if (error) {
          console.error('Error fetching trips:', error);
          setError(error.message);
        } else {
          setTrips(data || []);
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    };

    fetchUserAndTrips();
  }, [router]);

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <LoadingSpinner fill='fill-primary' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex justify-center items-center mx-auto h-screen'>
        <div className='p-8 rounded-lg border border-border flex flex-col items-center'>
          <h3 className='text-destructive mb-4 font-semibold'>
            Error: {error}
          </h3>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='flex justify-center items-center mx-auto h-screen'>
        <div className='p-8 rounded-lg border border-border flex flex-col items-center'>
          <h3 className='text-lg font-semibold'>
            You need to log in to view your profile
          </h3>
          <Link href='/login'>
            <Button className='mt-4'>Log in</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className='flex flex-col justify-center items-center min-h-screen'>
        <p>No fishing trips logged yet. Start logging your trips!</p>
        <Link href='/logbook'>
          <Button className='mt-4'>Log a trip</Button>
        </Link>
      </div>
    );
  }

  const totalCatches = trips.reduce(
    (sum, trip) => sum + trip.fish_caught.split(',').length,
    0
  );
  const uniqueLocations = new Set(trips.map((trip) => trip.location)).size;

  const fishCounts = trips.reduce((acc, trip) => {
    const fishList = trip.fish_caught.split(',').map((fish) => fish.trim());
    fishList.forEach((fish) => {
      const [species] = fish.split(' ');
      acc[species] = (acc[species] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(fishCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const locationData = trips.reduce((acc, trip) => {
    acc[trip.location] = (acc[trip.location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.entries(locationData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const tripsOverTime = trips
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce((acc, trip) => {
      const date = new Date(trip.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const lineChartData = Object.entries(tripsOverTime).map(([date, count]) => ({
    date,
    count,
  }));

  return (
    <main className='container mx-auto px-4 py-8 bg-background'>
      <Card className='mb-8 bg-card border border-border'>
        <CardHeader>
          <div className='flex items-center justify-between space-x-4'>
            <div className='flex items-center space-x-4'>
              <Avatar className='h-20 w-20'>
                <AvatarImage
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata.full_name}
                />
                <AvatarFallback>
                  {user.user_metadata.full_name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className='text-2xl'>
                  {user.user_metadata.full_name}
                </CardTitle>
                <p className='text-foreground/80'>{user.email}</p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
      <div className='flex items-center justify-end space-x-4 mb-8'>
        <Link href='/trips'>
          <Button variant='outline'>View All Trips</Button>
        </Link>
        <Link href='/logbook'>
          <Button>New Trip</Button>
        </Link>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
        <Card className='bg-card border border-border'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-normal tracking-tight'>
              Total Trips
            </CardTitle>
            <Calendar className='h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{trips.length}</div>
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
            <div className='text-2xl font-bold'>{totalCatches}</div>
          </CardContent>
        </Card>
        <Card className='bg-card border border-border'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-normal tracking-tight'>
              Unique Locations
            </CardTitle>
            <MapPin className='h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{uniqueLocations}</div>
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
    </main>
  );
}
