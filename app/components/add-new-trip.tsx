'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { toast } from '@/components/hooks/use-toast';

type FishingTrip = {
  id: string;
  user_id: string;
  date: string;
  location: string;
  fish_caught: string;
  weather: string;
  notes: string;
  image_url?: string;
};

export default function AddNewTrip() {
  const supabase = createClient();
  const user = supabase.auth.getUser();
  const [newTrip, setNewTrip] = useState<Omit<FishingTrip, 'id' | 'user_id'>>({
    date: '',
    location: '',
    fish_caught: '',
    weather: '',
    notes: '',
  });
  const [editingTrip, setEditingTrip] = useState<FishingTrip | null>(null);

  const fetchTrips = async (userId: string) => {
    const { data, error } = await supabase
      .from('fishing_trips')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching trips:', error);
    } else {
      console.log('Trips:', data);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewTrip((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const tripData = editingTrip
      ? { ...editingTrip, ...newTrip }
      : { ...newTrip, user_id: (await user).data.user!.id };

    const { error } = editingTrip
      ? await supabase
          .from('fishing_trips')
          .update(tripData)
          .eq('id', editingTrip.id)
      : await supabase.from('fishing_trips').insert(tripData);

    if (error) {
      console.error('Error saving trip:', error);
    } else {
      fetchTrips((await user).data.user!.id);
      setNewTrip({
        date: '',
        location: '',
        fish_caught: '',
        weather: '',
        notes: '',
      });
      setEditingTrip(null);
      toast({
        title: 'Trip saved! 🎣',
        description: 'Your fishing trip has been logged successfully.',
        variant: 'default',
        action: (
          <Link href='/trips'>
            <Button variant='outline'>View trip</Button>
          </Link>
        ),
      });
    }
  };

  return (
    <div className='container mx-auto p-4 max-w-4xl'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Log a new trip</h1>
      </div>

      <form onSubmit={handleSubmit} className='mb-8 space-y-4'>
        <Input
          type='date'
          name='date'
          value={newTrip.date}
          onChange={handleInputChange}
          required
          className='w-full text-base'
        />
        <Input
          type='text'
          name='location'
          placeholder='Fishing Location'
          value={newTrip.location}
          onChange={handleInputChange}
          required
          className='w-full text-base'
        />
        <Input
          type='text'
          name='fish_caught'
          placeholder='Fish Caught (species, size)'
          value={newTrip.fish_caught}
          onChange={handleInputChange}
          className='w-full text-base'
        />
        <Input
          type='text'
          name='weather'
          placeholder='Weather Conditions'
          value={newTrip.weather}
          onChange={handleInputChange}
          required
          className='w-full text-base'
        />
        <Textarea
          name='notes'
          placeholder='Additional Notes'
          value={newTrip.notes}
          onChange={handleInputChange}
          className='w-full text-base'
        />
        <Button type='submit' className='mr-4'>
          {editingTrip ? 'Update Trip' : 'Log Trip'}
        </Button>
        <Link href='/trips'>
          <Button variant='outline'>View all trips</Button>
        </Link>
      </form>
    </div>
  );
}
