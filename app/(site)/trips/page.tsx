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
  DialogDescription,
} from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import {
  Edit,
  Trash2,
  Upload,
  FishSymbol,
  CloudSunRain,
  Clock,
} from 'lucide-react';
import { toast } from '@/components/hooks/use-toast';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { GiFishingPole } from 'react-icons/gi';
import { useRouter } from 'next/navigation';

type FishCatch = {
  id: string;
  fish_type: string;
  caught_on: string;
  length?: number;
  weight?: number;
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);
  const client = createClient();
  const router = useRouter();

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
          .order('date', { ascending: false });

        if (tripsError)
          throw new Error('Failed to fetch trips: ' + tripsError.message);

        const tripsWithCatches = await Promise.all(
          tripsData.map(async (trip) => {
            const { data: catchesData, error: catchesError } = await client
              .from('fish_catches')
              .select('*')
              .eq('trip_id', trip.id);

            if (catchesError) throw catchesError;

            return { ...trip, fish_catches: catchesData };
          })
        );

        setTrips(tripsWithCatches || []);
      } else {
        router.push('/login');
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
    setTripToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (tripToDelete) {
      try {
        const { error } = await client
          .from('fishing_trips')
          .delete()
          .eq('id', tripToDelete);

        if (error) throw error;

        setTrips(trips.filter((trip) => trip.id !== tripToDelete));
        toast({
          title: 'Deleted',
          description: 'Trip deleted successfully',
          variant: 'default',
        });
      } catch (error) {
        console.error('Error deleting trip:', error);
        toast({
          title: 'Failed',
          description: 'Failed to delete trip',
          variant: 'destructive',
        });
      } finally {
        setIsDeleteDialogOpen(false);
        setTripToDelete(null);
      }
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
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          title: 'Failed',
          description: 'Failed to upload image. Please try again',
          variant: 'destructive',
        });
      } finally {
        e.target.value = '';
      }
    }
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTrip) return;

    try {
      const { error: tripError } = await client
        .from('fishing_trips')
        .update({
          date: editingTrip.date,
          time_of_day: editingTrip.time_of_day,
          location: editingTrip.location,
          weather: editingTrip.weather,
          notes: editingTrip.notes,
          catch_count: editingTrip.fish_catches.length,
        })
        .eq('id', editingTrip.id);

      if (tripError) throw tripError;

      for (const fishCatch of editingTrip.fish_catches) {
        if (fishCatch.id) {
          const { error: catchError } = await client
            .from('fish_catches')
            .update({
              fish_type: fishCatch.fish_type,
              caught_on: fishCatch.caught_on,
              length: fishCatch.length || null,
              weight: fishCatch.weight || null,
            })
            .eq('id', fishCatch.id);

          if (catchError) throw catchError;
        } else {
          const { error: catchError } = await client
            .from('fish_catches')
            .insert({
              trip_id: editingTrip.id,
              fish_type: fishCatch.fish_type,
              caught_on: fishCatch.caught_on,
              length: fishCatch.length || null,
              weight: fishCatch.weight || null,
            });

          if (catchError) throw catchError;
        }
      }

      setTrips(
        trips.map((trip) => (trip.id === editingTrip.id ? editingTrip : trip))
      );
      setIsEditDialogOpen(false);
      toast({
        title: 'Success',
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
        <LoadingSpinner fill='fill-primary' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Card className='flex flex-col justify-center items-center border border-border'>
          <CardContent className='text-red-500 font-semibold p-4'>
            Error: {error}
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardFooter>
        </Card>
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
            <SelectContent className='border border-border'>
              <SelectItem value='date'>Date</SelectItem>
              <SelectItem value='location'>Location</SelectItem>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Sort order' />
            </SelectTrigger>
            <SelectContent className='border border-border'>
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
            className='w-full sm:w-[200px] text-base'
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
              className='flex flex-col overflow-hidden border border-border'
            >
              <Link key={trip.id} href={`/trips/${trip.id}`}>
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
              </Link>
              <CardHeader>
                <CardTitle>{trip.location}</CardTitle>
              </CardHeader>
              <CardContent className='flex-grow'>
                <div className='grid grid-cols-2 gap-2 text-sm'>
                  <div className='flex items-center'>
                    <CloudSunRain className='h-4 w-4 mr-2 text-primary' />
                    {trip.weather}
                  </div>
                  <div className='flex items-center'>
                    <Clock className='h-4 w-4 mr-2 text-primary' />
                    {trip.time_of_day}
                  </div>
                  <div className='flex mt-2'>
                    <FishSymbol className='h-4 w-4 mr-2 text-primary' />
                    {trip.catch_count}
                    {trip.catch_count === 1 ? ' fish' : ' fishes'} caught
                  </div>
                  {trip.fish_catches.length > 0 && (
                    <div className='mt-2'>
                      {trip.fish_catches.map(
                        (fishCatch, index) =>
                          fishCatch.fish_type &&
                          fishCatch.caught_on && (
                            <li key={index} className='text-foreground/80'>
                              {`${fishCatch.fish_type} (${fishCatch.caught_on})`}
                            </li>
                          )
                      )}
                    </div>
                  )}
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
            <div className='flex flex-col gap-4 py-4'>
              <div className='flex flex-row gap-4'>
                <div className='items-center gap-4'>
                  <label htmlFor='location' className='text-left'>
                    Location
                  </label>
                  <Input
                    id='location'
                    placeholder='Location'
                    value={editingTrip?.location}
                    onChange={(e) =>
                      setEditingTrip((prev) =>
                        prev ? { ...prev, location: e.target.value } : null
                      )
                    }
                    className='text-base'
                  />
                </div>
                <div className='items-center gap-4'>
                  <label htmlFor='date' className='text-left'>
                    Date
                  </label>
                  <Input
                    id='date'
                    type='date'
                    placeholder='Date'
                    value={editingTrip?.date}
                    onChange={(e) =>
                      setEditingTrip((prev) =>
                        prev ? { ...prev, date: e.target.value } : null
                      )
                    }
                    className='text-base'
                  />
                </div>
              </div>
              <div className='flex flex-row gap-4'>
                <div className=' items-center gap-4'>
                  <label htmlFor='time_of_day' className='text-left'>
                    Time of Day
                  </label>
                  <Select
                    value={editingTrip?.time_of_day}
                    onValueChange={(value) =>
                      setEditingTrip((prev) =>
                        prev ? { ...prev, time_of_day: value } : null
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select time of day' />
                    </SelectTrigger>
                    <SelectContent className='text-base border border-border'>
                      <SelectItem value='Morning'>Morning</SelectItem>
                      <SelectItem value='Afternoon'>Afternoon</SelectItem>
                      <SelectItem value='Evening'>Evening</SelectItem>
                      <SelectItem value='Night'>Night</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className=' items-center gap-4'>
                  <label htmlFor='weather' className='text-left'>
                    Weather
                  </label>
                  <Input
                    id='weather'
                    placeholder='Weather'
                    value={editingTrip?.weather}
                    onChange={(e) =>
                      setEditingTrip((prev) =>
                        prev ? { ...prev, weather: e.target.value } : null
                      )
                    }
                    className='text-base'
                  />
                </div>
              </div>
              <div className='items-center gap-4'>
                <label htmlFor='notes' className='text-left'>
                  Notes
                </label>
                <Textarea
                  id='notes'
                  placeholder='Notes'
                  value={editingTrip?.notes || ''}
                  onChange={(e) =>
                    setEditingTrip((prev) =>
                      prev ? { ...prev, notes: e.target.value } : null
                    )
                  }
                  className='text-base'
                />
              </div>
              <div className='col-span-4'>
                <h3 className='text-lg'>Fish Catches</h3>

                {editingTrip?.fish_catches.map((fishCatch, index) => (
                  <div key={index} className='grid grid-cols-2 gap-4 mb-2'>
                    <div>
                      <label htmlFor='fish_type' className='text-left'>
                        Fish Type
                      </label>
                      <Input
                        id='fish_type'
                        value={fishCatch.fish_type || ''}
                        onChange={(e) =>
                          setEditingTrip((prev) => {
                            if (!prev) return null;
                            const newCatches = [...prev.fish_catches];
                            newCatches[index].fish_type = e.target.value;
                            return { ...prev, fish_catches: newCatches };
                          })
                        }
                        placeholder='Fish type'
                        className='text-base'
                      />
                    </div>
                    <div>
                      <label htmlFor='caught_on' className='text-left'>
                        Fly used
                      </label>
                      <Input
                        id='Fly used'
                        value={fishCatch.caught_on || ''}
                        onChange={(e) =>
                          setEditingTrip((prev) => {
                            if (!prev) return null;
                            const newCatches = [...prev.fish_catches];
                            newCatches[index].caught_on = e.target.value;
                            return { ...prev, fish_catches: newCatches };
                          })
                        }
                        placeholder='Fly used'
                        className='text-base'
                      />
                    </div>
                    <div>
                      <label htmlFor='length' className='text-left'>
                        Length (cm)
                      </label>
                      <Input
                        id='length'
                        type='number'
                        value={fishCatch.length || ''}
                        onChange={(e) =>
                          setEditingTrip((prev) => {
                            if (!prev) return null;
                            const newCatches = [...prev.fish_catches];
                            newCatches[index].length = parseFloat(
                              e.target.value
                            );
                            return { ...prev, fish_catches: newCatches };
                          })
                        }
                        placeholder='Length (cm)'
                        className='text-base'
                      />
                    </div>
                    <div>
                      <label htmlFor='weight' className='text-left'>
                        Weight (g)
                      </label>
                      <Input
                        id='weight'
                        type='number'
                        value={fishCatch.weight || ''}
                        onChange={(e) =>
                          setEditingTrip((prev) => {
                            if (!prev) return null;
                            const newCatches = [...prev.fish_catches];
                            newCatches[index].weight = parseFloat(
                              e.target.value
                            );
                            return { ...prev, fish_catches: newCatches };
                          })
                        }
                        placeholder='Weight (gram)'
                        className='text-base'
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type='button'
                  onClick={() =>
                    setEditingTrip((prev) =>
                      prev
                        ? {
                            ...prev,
                            fish_catches: [
                              ...prev.fish_catches,
                              {
                                id: '',
                                fish_type: '',
                                caught_on: '',
                                length: 0,
                                weight: 0,
                              },
                            ],
                          }
                        : null
                    )
                  }
                  className='mt-2'
                >
                  Add Fish Catch
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button type='submit'>Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className='bg-card border border-border rounded-lg'>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this fishing trip? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='sm:flex sm:justify-end gap-2'>
            <Button
              variant='outline'
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant='destructive' onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
