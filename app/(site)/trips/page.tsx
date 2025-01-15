'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import {
  Edit,
  Trash2,
  Upload,
  ImageOff,
  FishSymbol,
  CloudSunRain,
} from 'lucide-react';
import { toast } from '@/components/hooks/use-toast';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { GiFishingPole } from 'react-icons/gi';

type FishingTrip = {
  id: string;
  user_id: string;
  date: string;
  location: string;
  fish_caught: string;
  weather: string;
  notes: string;
  image_url: string | null;
};

const BUCKET_NAME = 'trip-images';

export default function TripsPage() {
  const [trips, setTrips] = useState<FishingTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<keyof FishingTrip>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterLocation, setFilterLocation] = useState('');
  const [editingTrip, setEditingTrip] = useState<FishingTrip | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const client = createClient();

  useEffect(() => {
    fetchTrips();
  }, []);

  async function fetchTrips() {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await client.auth.getUser();
      if (user) {
        const { data: tripsData, error: tripsError } = await client
          .from('fishing_trips')
          .select('*')
          .eq('user_id', user.id);

        if (tripsError)
          throw new Error('Failed to fetch trips: ' + tripsError.message);

        setTrips(tripsData || []);
      } else {
        throw new Error('No user found');
      }
    } catch (err) {
      console.error('Error in fetchTrips:', err);
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    } finally {
      setLoading(false);
    }
  }

  const sortedAndFilteredTrips = useMemo(() => {
    return trips
      .filter((trip) =>
        trip.location.toLowerCase().includes(filterLocation.toLowerCase())
      )
      .sort((a, b) => {
        if (a[sortBy] && b[sortBy] && a[sortBy] < b[sortBy])
          return sortOrder === 'asc' ? -1 : 1;
        if (a[sortBy] && b[sortBy] && a[sortBy] > b[sortBy])
          return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [trips, sortBy, sortOrder, filterLocation]);

  const handleEdit = (trip: FishingTrip) => {
    setEditingTrip(trip);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        const { error } = await client
          .from('fishing_trips')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setTrips(trips.filter((trip) => trip.id !== id));
      } catch (error) {
        console.error('Error deleting trip:', error);
        toast({
          title: 'Failed',
          description: 'Failed to delete trip',
          variant: 'destructive',
        });
      }
      toast({
        title: 'Deleted',
        description: 'Trip deleted successfully',
        variant: 'default',
      });
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    tripId: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        toast({
          variant: 'default',
          title: 'Uploading image...',
          action: <LoadingSpinner fill='primary' />,
        });
        setUploadStatus('Uploading image...');
        const {
          data: { user },
        } = await client.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${tripId}/${Math.random()}.${fileExt}`;

        const { error: uploadError, data } = await client.storage
          .from(BUCKET_NAME)
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        if (!data) throw new Error('Upload successful but no data returned');

        const {
          data: { publicUrl },
        } = client.storage.from(BUCKET_NAME).getPublicUrl(data.path);

        const { error: updateError } = await client
          .from('fishing_trips')
          .update({ image_url: publicUrl })
          .eq('id', tripId);

        if (updateError) throw updateError;

        setTrips(
          trips.map((trip) =>
            trip.id === tripId ? { ...trip, image_url: publicUrl } : trip
          )
        );
        toast({
          title: 'Success! 🎉',
          description: 'Image uploaded successfully',
          variant: 'default',
        });
        setUploadStatus('Upload successful!');
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          title: 'Failed',
          description: 'Failed to upload image. Please try again',
          variant: 'destructive',
        });
        setUploadStatus('Upload failed. Please try again.');
      } finally {
        setTimeout(() => setUploadStatus(null), 3000);
      }
    }
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTrip) return;

    try {
      const { error } = await client
        .from('fishing_trips')
        .update({
          date: editingTrip.date,
          location: editingTrip.location,
          fish_caught: editingTrip.fish_caught,
          weather: editingTrip.weather,
          notes: editingTrip.notes,
        })
        .eq('id', editingTrip.id);

      if (error) throw error;

      setTrips(
        trips.map((trip) => (trip.id === editingTrip.id ? editingTrip : trip))
      );
      setIsEditDialogOpen(false);
      toast({
        title: 'Updated',
        description: 'Trip updated successfully',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error updating trip:', error);
      toast({
        title: 'Failed',
        description: 'Failed to update trip',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <LoadingSpinner fill='primary' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col justify-center items-center h-screen'>
        <p className='text-red-500 mb-4'>Error: {error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <main className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-6'>My Fishing Trips</h1>

      <div className='mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4'>
        <div className='flex items-center space-x-4'>
          <Select
            onValueChange={(value) => setSortBy(value as keyof FishingTrip)}
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Sort by' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='date'>Date</SelectItem>
              <SelectItem value='location'>Location</SelectItem>
              <SelectItem value='fish_caught'>Fish Caught</SelectItem>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Sort order' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='asc'>Ascending</SelectItem>
              <SelectItem value='desc'>Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='flex items-center space-x-4'>
          <Input
            type='text'
            placeholder='Filter by location'
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className='w-full sm:w-[200px]'
          />
          <Link href='/logbook'>
            <Button variant='default' size='sm'>
              New trip
            </Button>
          </Link>
        </div>
      </div>

      {sortedAndFilteredTrips.length === 0 ? (
        <p className='text-center'>
          No fishing trips logged yet. Start logging your trips!
        </p>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {sortedAndFilteredTrips.map((trip) => (
            <Card
              key={trip.id}
              className='overflow-hidden border border-border'
            >
              <div className='relative h-48'>
                {trip.image_url ? (
                  <Image
                    src={trip.image_url || '/placeholder.svg'}
                    alt={`Trip to ${trip.location}`}
                    layout='fill'
                    objectFit='cover'
                  />
                ) : (
                  <div className='flex items-center justify-center h-full bg-background'>
                    <GiFishingPole color='primary' className='w-12 h-12' />
                  </div>
                )}
                <div className='absolute top-2 right-2'>
                  <Badge variant='secondary'>
                    {new Date(trip.date).toLocaleDateString()}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle>{trip.location}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-2 gap-2 text-sm'>
                  <div className='flex items-center'>
                    <FishSymbol className='h-4 w-4 mr-2 text-primary' />
                    {trip.fish_caught}
                  </div>
                  <div className='flex items-center'>
                    <CloudSunRain className='h-4 w-4 mr-2 text-primary' />
                    {trip.weather}
                  </div>
                </div>
                {trip.notes && (
                  <p className='mt-2 text-sm text-muted-foreground'>
                    {trip.notes}
                  </p>
                )}
              </CardContent>
              <CardFooter className='flex justify-between'>
                <label className='cursor-pointer'>
                  <Input
                    type='file'
                    className='hidden'
                    onChange={(e) => handleImageUpload(e, trip.id)}
                    accept='image/*'
                  />
                  <Button variant='outline' size='sm' asChild>
                    <span>
                      <Upload className='h-4 w-4 mr-2' />
                      Upload image
                    </span>
                  </Button>
                </label>
                <div className='flex items-center space-x-2'>
                  <Button
                    variant='secondary'
                    size='sm'
                    onClick={() => handleEdit(trip)}
                  >
                    <Edit className='h-4 w-4 mr-2' />
                    Edit
                  </Button>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() => handleDelete(trip.id)}
                  >
                    <Trash2 className='h-4 w-4 mr-2' />
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='bg-card border border-border rounded-lg'>
          <DialogHeader>
            <DialogTitle>Edit Fishing Trip</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit}>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-4 items-center gap-4'>
                <label htmlFor='date' className='text-right'>
                  Date
                </label>
                <Input
                  id='date'
                  type='date'
                  value={editingTrip?.date}
                  onChange={(e) =>
                    setEditingTrip((prev) =>
                      prev ? { ...prev, date: e.target.value } : null
                    )
                  }
                  className='col-span-3'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <label htmlFor='location' className='text-right'>
                  Location
                </label>
                <Input
                  id='location'
                  value={editingTrip?.location}
                  onChange={(e) =>
                    setEditingTrip((prev) =>
                      prev ? { ...prev, location: e.target.value } : null
                    )
                  }
                  className='col-span-3'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <label htmlFor='fish_caught' className='text-right'>
                  Fish Caught
                </label>
                <Input
                  id='fish_caught'
                  value={editingTrip?.fish_caught}
                  onChange={(e) =>
                    setEditingTrip((prev) =>
                      prev ? { ...prev, fish_caught: e.target.value } : null
                    )
                  }
                  className='col-span-3'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <label htmlFor='weather' className='text-right'>
                  Weather
                </label>
                <Input
                  id='weather'
                  value={editingTrip?.weather}
                  onChange={(e) =>
                    setEditingTrip((prev) =>
                      prev ? { ...prev, weather: e.target.value } : null
                    )
                  }
                  className='col-span-3'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <label htmlFor='notes' className='text-right'>
                  Notes
                </label>
                <Textarea
                  id='notes'
                  value={editingTrip?.notes}
                  onChange={(e) =>
                    setEditingTrip((prev) =>
                      prev ? { ...prev, notes: e.target.value } : null
                    )
                  }
                  className='col-span-3'
                />
              </div>
            </div>
            <DialogFooter>
              <Button type='submit'>Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
