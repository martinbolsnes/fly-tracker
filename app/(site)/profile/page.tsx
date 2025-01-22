'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { FishSymbol, MapPin, Calendar, Upload } from 'lucide-react';
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
import { toast } from '@/components/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { FishingStatistics } from '@/app/components/stastistics';

type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
};

type FishCatch = {
  fish_type: string;
  caught_on: string;
};

type FishingTrip = {
  id: string;
  user_id: string;
  date: string;
  time_of_day: string;
  location: string;
  weather: string;
  notes: string | null;
  image_url: string | null;
  catch_count: number;
  fish_catches: FishCatch[];
};

export default function ProfilePage() {
  const [trips, setTrips] = useState<FishingTrip[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editMode, setEditMode] = useState(false);
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
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setError(profileError.message);
        } else {
          setProfile(profileData);
          setNewUsername(profileData.username);
        }

        const { data: tripsData, error: tripsError } = await supabase
          .from('fishing_trips')
          .select('*')
          .eq('user_id', user.id);
        if (tripsError) {
          console.error('Error fetching trips:', tripsError);
          setError(tripsError.message);
        } else {
          const tripsWithCatches = await Promise.all(
            (tripsData || []).map(async (trip) => {
              const { data: catchesData, error: catchesError } = await supabase
                .from('fish_catches')
                .select('*')
                .eq('trip_id', trip.id);
              if (catchesError) {
                console.error('Error fetching catches:', catchesError);
                setError(catchesError.message);
              }
              return { ...trip, fish_catches: catchesData || [] };
            })
          );
          setTrips(tripsWithCatches);
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    };

    fetchUserAndTrips();
  }, [router]);

  const handleUpdateProfile = async () => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername })
        .eq('id', user.id);

      if (error) throw error;

      setProfile({ ...profile, username: newUsername });
      setEditMode(false);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : null));
      toast({
        title: 'Avatar Updated',
        description: 'Your profile picture has been successfully updated.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload profile picture. Please try again.',
        variant: 'destructive',
      });
    }
  };

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
        <Card className='border border-border flex flex-col items-center'>
          <CardContent className='text-red-500 mb-4 font-semibold'>
            Error: {error}
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='flex justify-center items-center mx-auto h-screen'>
        <Card className='border border-border flex flex-col items-center'>
          <CardContent className='text-lg font-semibold'>
            You need to log in to view your profile
          </CardContent>
          <CardFooter>
            <Link href='/login'>
              <Button className='mt-4'>Log in</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <main className='container mx-auto px-4 py-8 bg-background'>
        <Card className='mb-8 bg-card border border-border'>
          <CardHeader>
            <div className='flex items-center justify-between space-x-4'>
              <div className='flex items-center space-x-4'>
                <Avatar className='h-20 w-20'>
                  <AvatarImage
                    src={profile?.avatar_url || ''}
                    alt={profile?.username || ''}
                  />
                  <AvatarFallback>
                    {user.user_metadata.full_name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  {editMode ? (
                    <Input
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className='mb-2 text-base'
                    />
                  ) : (
                    <>
                      <CardTitle className='text-2xl'>
                        {profile?.username || user.user_metadata.full_name}
                      </CardTitle>
                      <p className='text-foreground/80'>
                        @{profile?.username || 'Username'}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center space-x-2 '>
            <label className='cursor-pointer'>
              <Input
                type='file'
                className='hidden'
                onChange={handleAvatarUpload}
                accept='image/*'
              />
              <Button variant='outline' size='sm' asChild>
                <span>
                  <Upload className='h-4 w-4 mr-2' />
                  Update Avatar
                </span>
              </Button>
            </label>
            {editMode ? (
              <Button variant='default' size='sm' onClick={handleUpdateProfile}>
                Save
              </Button>
            ) : (
              <Button
                variant='secondary'
                size='sm'
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>
        <div className='flex flex-col items-center h-screen'>
          <p>No fishing trips logged yet. Start logging your trips!</p>
          <Link href='/logbook'>
            <Button className='mt-4'>Log a trip</Button>
          </Link>
        </div>
      </main>
    );
  }

  const totalCatches = trips.reduce(
    (sum, trip) => sum + trip.fish_catches.length,
    0
  );
  const favoriteLocation = Object.entries(
    trips.reduce((acc, trip) => {
      acc[trip.location] = (acc[trip.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1])[0][0];

  const fishCounts = trips.reduce((acc, trip) => {
    const fishList = trip.fish_catches.map((fish) => fish.fish_type.trim());
    fishList.forEach((fish) => {
      const [species] = fish.split(' ');
      acc[species] = (acc[species] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(fishCounts)
    .filter(([name]) => name !== 'No catch')
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
                  src={profile?.avatar_url || ''}
                  alt={profile?.username || ''}
                />
                <AvatarFallback>
                  {user.user_metadata.full_name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                {editMode ? (
                  <Input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className='mb-2 text-base'
                  />
                ) : (
                  <>
                    <CardTitle className='text-2xl'>
                      {user.user_metadata.full_name}
                    </CardTitle>
                    <p className='text-foreground/80'>
                      @{profile?.username || 'Username'}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
      <div className='flex items-center justify-between mb-8'>
        <div className='flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0'>
          <label className='cursor-pointer'>
            <Input
              type='file'
              className='hidden'
              onChange={handleAvatarUpload}
              accept='image/*'
            />
            <Button variant='outline' size='sm' asChild>
              <span>
                <Upload className='h-4 w-4 mr-2' />
                Update Avatar
              </span>
            </Button>
          </label>
          {editMode ? (
            <Button variant='default' size='sm' onClick={handleUpdateProfile}>
              Save
            </Button>
          ) : (
            <Button
              variant='secondary'
              size='sm'
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </Button>
          )}
        </div>
        <div className='flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0'>
          <Link href='/trips'>
            <Button variant='outline'>View All Trips</Button>
          </Link>
          <Link href='/logbook'>
            <Button>New Trip</Button>
          </Link>
        </div>
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
              Favorite Location
            </CardTitle>
            <MapPin className='h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {favoriteLocation || 'No data'}
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
      <FishingStatistics userId={user.id} />
    </main>
  );
}
