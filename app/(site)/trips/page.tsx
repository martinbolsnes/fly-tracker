'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { useImageUpload } from '../../../components/hooks/use-image-upload';
import { useTripManagement } from '../../../components/hooks/use-trip-management';
import { TripCard } from '@/app/components/trip-card';
import { EditTripForm } from '@/app/components/edit-trip-form';
import { FishingTrip } from '../../types';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export default function TripsPage() {
  const {
    trips,
    loading,
    error,
    setSortBy,
    setSortOrder,
    filterLocation,
    setFilterLocation,
    deleteTrip,
    fetchTrips,
  } = useTripManagement();

  const client = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await client.auth.getUser();
      if (user) {
        setUser(user);
      }
    };
    fetchUser();
  }, []);

  const { uploadImage } = useImageUpload();
  const [editingTrip, setEditingTrip] = useState<FishingTrip | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);

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
      await deleteTrip(tripToDelete);
      setIsDeleteDialogOpen(false);
      setTripToDelete(null);
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    tripId: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (user?.id) {
        const publicUrl = await uploadImage(file, user.id, tripId);
        if (publicUrl) {
          await fetchTrips();
        }
        e.target.value = '';
      } else {
        throw new Error('User not found');
      }
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
        <div className='text-red-500 font-semibold p-4'>
          Error: {error}
          <Button onClick={() => window.location.reload()} className='ml-4'>
            Retry
          </Button>
        </div>
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

      {trips.length === 0 ? (
        <p className='text-center'>
          No fishing trips logged yet. Start logging your trips!
        </p>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onImageUpload={handleImageUpload}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='bg-card border border-border rounded-lg overflow-y-scroll'>
          <DialogHeader>
            <DialogTitle>Edit Fishing Trip</DialogTitle>
          </DialogHeader>
          <EditTripForm
            trip={editingTrip}
            onSave={async () => {
              await fetchTrips();
              setIsEditDialogOpen(false);
            }}
          />
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
