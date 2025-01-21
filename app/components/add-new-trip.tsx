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
import { LoadingSpinner } from './LoadingSpinner';

type FishCatch = {
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
};

const initialFishCatch = {
  fish_type: '',
  caught_on: '',
  length: 0,
  weight: 0,
};

export default function AddNewTrip() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [newTrip, setNewTrip] = useState<Omit<FishingTrip, 'id' | 'user_id'>>({
    date: '',
    time_of_day: '',
    location: '',
    weather: '',
    notes: '',
    image_url: null,
    catch_count: 0,
  });
  const [fishCatches, setFishCatches] = useState<FishCatch[]>([
    initialFishCatch,
  ]);
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
          length: fishCatch.length || null,
          weight: fishCatch.weight || null,
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
    setFishCatches([...fishCatches, initialFishCatch]);
  };

  const updateFishCatch = (
    index: number,
    field: keyof FishCatch,
    value: number | string | null
  ) => {
    setFishCatches((prevFishCatches) => {
      const updatedFishCatches = [...prevFishCatches];
      updatedFishCatches[index] = {
        ...updatedFishCatches[index],
        [field]: value,
      };
      return updatedFishCatches;
    });
  };

  const removeFishCatch = (index: number) => {
    const updatedFishCatches = fishCatches.filter((_, i) => i !== index);
    setFishCatches(updatedFishCatches);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <h2 className='text-2xl'>Add New Trip</h2>
      <div className='grid grid-cols-1 gap-4 mb-2'>
        <div>
          <label htmlFor='location' className='text-left'>
            Location
          </label>
          <Input
            type='text'
            name='location'
            placeholder='Location'
            required
            value={newTrip.location}
            onChange={handleInputChange}
            className='text-base'
          />
        </div>
        <div>
          <label htmlFor='date' className='text-left'>
            Date
          </label>
          <Input
            type='date'
            name='date'
            required
            value={newTrip.date}
            onChange={handleInputChange}
            className='text-base'
          />
        </div>
        <div>
          <label htmlFor='time_of_day' className='text-left'>
            Time of day
          </label>
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
            <SelectContent className='text-base border border-border'>
              <SelectItem value='Morning'>Morning</SelectItem>
              <SelectItem value='Afternoon'>Afternoon</SelectItem>
              <SelectItem value='Evening'>Evening</SelectItem>
              <SelectItem value='Night'>Night</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor='weather' className='text-left'>
            Weather
          </label>
          <Input
            type='text'
            name='weather'
            placeholder='Weather'
            required
            value={newTrip.weather}
            onChange={handleInputChange}
            className='text-base'
          />
        </div>
        <div>
          <label htmlFor='notes' className='text-left'>
            Notes
          </label>
          <Textarea
            name='notes'
            placeholder='Notes'
            value={newTrip.notes || ''}
            onChange={(e) => setNewTrip({ ...newTrip, notes: e.target.value })}
            className='text-base'
          />
        </div>
      </div>

      <div className='space-y-4'>
        <h3 className='text-lg'>Fish Catches</h3>
        {fishCatches.map((fishCatch, index) => (
          <div key={index} className='grid grid-cols-2 gap-4 mb-2'>
            <div>
              <label htmlFor='fish_type' className='text-left'>
                Fish Type
              </label>
              <Input
                id='fish_type'
                type='text'
                placeholder='Fish type'
                value={fishCatch.fish_type || ''}
                onChange={(e) =>
                  updateFishCatch(index, 'fish_type', e.target.value)
                }
                className='text-base'
              />
            </div>
            <div>
              <label htmlFor='caught_on' className='text-left'>
                Fly used
              </label>
              <Input
                id='fly_used'
                type='text'
                placeholder='Fly used'
                value={fishCatch.caught_on || ''}
                onChange={(e) =>
                  updateFishCatch(index, 'caught_on', e.target.value)
                }
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
                placeholder='Length (cm)'
                value={fishCatch.length || ''}
                onChange={(e) =>
                  updateFishCatch(index, 'length', parseFloat(e.target.value))
                }
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
                placeholder='Weight (g)'
                value={fishCatch.weight || ''}
                onChange={(e) =>
                  updateFishCatch(index, 'weight', parseFloat(e.target.value))
                }
                className='text-base'
              />
            </div>
            {index > -1 && (
              <div className='col-span-2'>
                <Button
                  type='button'
                  variant='secondary'
                  size='icon'
                  className='w-full'
                  onClick={() => removeFishCatch(index)}
                >
                  <X className='mr-2 h-4 w-4' />
                  Remove Fish
                </Button>
              </div>
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
        {loading ? <LoadingSpinner /> : 'Log Trip'}
      </Button>
    </form>
  );
}
