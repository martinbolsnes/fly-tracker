'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { toast } from '@/components/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { PlusCircle, X } from 'lucide-react';

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
};

export default function AddNewTrip() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fishCatches, setFishCatches] = useState<FishCatch[]>([
    { fish_type: '', caught_on: '' },
  ]);
  const [newTrip, setNewTrip] = useState<Omit<FishingTrip, 'id' | 'user_id'>>({
    date: '',
    time_of_day: '',
    location: '',
    weather: '',
    notes: '',
    image_url: null,
    catch_count: 0,
  });
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await supabase.auth.getUser();
      setUserId(user.data.user?.id || null);
    };

    fetchUser();
  }, [supabase]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewTrip({ ...newTrip, [name]: value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const tripData = {
      ...newTrip,
      user_id: userId,
    };

    try {
      // Insert trip data
      const { data: insertedTripData, error: tripError } = await supabase
        .from('fishing_trips')
        .insert([tripData])
        .select();

      if (tripError) throw tripError;

      const tripId = insertedTripData[0].id;

      const validFishCatches = fishCatches.filter(
        (fishCatch) =>
          fishCatch.fish_type.trim() !== '' && fishCatch.caught_on.trim() !== ''
      );

      if (validFishCatches.length > 0) {
        const catchesData = validFishCatches.map((fishCatch) => ({
          trip_id: tripId,
          fish_type: fishCatch.fish_type,
          caught_on: fishCatch.caught_on,
        }));

        const { error: catchesError } = await supabase
          .from('fish_catches')
          .insert(catchesData);

        if (catchesError) throw catchesError;

        const { error: updateError } = await supabase
          .from('fishing_trips')
          .update({ catch_count: validFishCatches.length })
          .eq('id', tripId);

        if (updateError) throw updateError;
      }

      toast({
        title: 'Trip Added 🎣',
        description: 'Trip added successfully',
        variant: 'default',
      });
      router.push('/trips');
    } catch (error) {
      console.error('Error adding trip:', error);
      toast({
        title: 'Error',
        description: 'Failed to add trip. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addFishCatch = () => {
    setFishCatches([...fishCatches, { fish_type: '', caught_on: '' }]);
  };

  const removeFishCatch = (index: number) => {
    setFishCatches(fishCatches.filter((_, i) => i !== index));
  };

  const updateFishCatch = (
    index: number,
    field: keyof FishCatch,
    value: string
  ) => {
    const updatedCatches = [...fishCatches];
    updatedCatches[index][field] = value;
    setFishCatches(updatedCatches);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <Input
        type='date'
        name='date'
        required
        value={newTrip.date}
        onChange={handleInputChange}
      />
      <Select
        name='time_of_day'
        required
        value={newTrip.time_of_day}
        onValueChange={(value) =>
          setNewTrip({ ...newTrip, time_of_day: value })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder='Time of day' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='Morning'>Morning</SelectItem>
          <SelectItem value='Afternoon'>Afternoon</SelectItem>
          <SelectItem value='Evening'>Evening</SelectItem>
          <SelectItem value='Night'>Night</SelectItem>
        </SelectContent>
      </Select>
      <Input
        type='text'
        name='location'
        placeholder='Location'
        required
        value={newTrip.location}
        onChange={handleInputChange}
      />
      <Input
        type='text'
        name='weather'
        placeholder='Weather'
        required
        value={newTrip.weather}
        onChange={handleInputChange}
      />
      <Textarea
        name='notes'
        placeholder='Notes'
        value={newTrip.notes || ''}
        onChange={(e) => setNewTrip({ ...newTrip, notes: e.target.value })}
      />

      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>Fish Catches</h3>
        {fishCatches.map((fishCatch, index) => (
          <div key={index} className='flex items-center space-x-2'>
            <Input
              type='text'
              placeholder='Fish type'
              value={fishCatch.fish_type}
              onChange={(e) =>
                updateFishCatch(index, 'fish_type', e.target.value)
              }
            />
            <Input
              type='text'
              placeholder='Fly used'
              value={fishCatch.caught_on}
              onChange={(e) =>
                updateFishCatch(index, 'caught_on', e.target.value)
              }
            />
            {index > 0 && (
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() => removeFishCatch(index)}
              >
                <X className='h-4 w-4' />
              </Button>
            )}
          </div>
        ))}
        <Button
          type='button'
          variant='outline'
          onClick={addFishCatch}
          className='w-full'
        >
          <PlusCircle className='h-4 w-4 mr-2' />
          Add Another Fish
        </Button>
      </div>

      <Button type='submit' disabled={loading}>
        {loading ? 'Adding...' : 'Add Trip'}
      </Button>
    </form>
  );
}
