'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import { PlusCircle, X } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/hooks/use-toast';

const fishCatchSchema = z.object({
  fish_type: z.string().min(1, 'Fish type is required'),
  caught_on: z.string().optional(),
  length: z.number().nullable().optional(),
  weight: z.number().nullable().optional(),
});

const tripSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  time_of_day: z.string().min(1, 'Time of day is required'),
  location: z.string().min(1, 'Location is required'),
  weather: z.string().min(1, 'Weather is required'),
  notes: z.string().nullable(),
  water_temperature: z.number().nullable(),
  air_temperature: z.number().nullable(),
  fish_catches: z.array(fishCatchSchema),
});

const useAddNewTrip = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof tripSchema>>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      date: '',
      time_of_day: '',
      location: '',
      weather: '',
      notes: '',
      water_temperature: null,
      air_temperature: null,
      fish_catches: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'fish_catches',
  });

  useEffect(() => {
    const fetchUser = async () => {
      const user = await supabase.auth.getUser();
      setUserId(user.data.user?.id || null);
    };

    fetchUser();
  }, [supabase]);

  const onSubmit = async (data: z.infer<typeof tripSchema>) => {
    setLoading(true);

    try {
      const tripData = {
        user_id: userId,
        date: data.date,
        time_of_day: data.time_of_day,
        location: data.location,
        weather: data.weather,
        notes: data.notes,
        image_url: null,
        catch_count: data.fish_catches.length,
        water_temperature: data.water_temperature,
        air_temperature: data.air_temperature,
      };

      const { data: insertedTripData, error: tripError } = await supabase
        .from('fishing_trips')
        .insert([tripData])
        .select();

      if (tripError) throw tripError;

      const tripId = insertedTripData[0].id;

      if (data.fish_catches.length > 0) {
        const catchesData = data.fish_catches.map((fishCatch) => ({
          trip_id: tripId,
          ...fishCatch,
        }));

        const { error: catchesError } = await supabase
          .from('fish_catches')
          .insert(catchesData);

        if (catchesError) throw catchesError;
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

  return { form, fields, append, remove, onSubmit, loading };
};

export default function AddNewTrip() {
  const { form, fields, append, remove, onSubmit, loading } = useAddNewTrip();

  return (
    <div className='w-full'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-col space-y-6'
        >
          <h2 className='text-2xl font-bold'>Log New Trip</h2>

          <FormField
            control={form.control}
            name='location'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input
                    className='text-base'
                    placeholder='Enter fishing location'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='date'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input
                    className='text-base'
                    placeholder='Enter date'
                    type='date'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex items-center space-x-4'>
            <FormField
              control={form.control}
              name='time_of_day'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time of Day</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select time of day' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className='text-base border border-border'>
                      <SelectItem value='Morning'>Morning</SelectItem>
                      <SelectItem value='Afternoon'>Afternoon</SelectItem>
                      <SelectItem value='Evening'>Evening</SelectItem>
                      <SelectItem value='Night'>Night</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='weather'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weather</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select weather condition' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className='text-base border border-border'>
                      <SelectItem value='Sunny'>Sunny</SelectItem>
                      <SelectItem value='Rainy'>Rainy</SelectItem>
                      <SelectItem value='Partly Cloudy'>
                        Partly Cloudy
                      </SelectItem>
                      <SelectItem value='Overcast'>Overcast</SelectItem>
                      <SelectItem value='Clear'>Clear sky</SelectItem>
                      <SelectItem value='Snowy'>Snowy</SelectItem>
                      <SelectItem value='Drizzly'>Drizzly</SelectItem>
                      <SelectItem value='Foggy'>Foggy</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='water_temperature'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Water Temperature (°C)</FormLabel>
                <FormControl>
                  <Input
                    className='text-base'
                    type='number'
                    placeholder='Enter water temperature'
                    {...field}
                    value={field.value !== null ? field.value : ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : null
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='air_temperature'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Air Temperature (°C)</FormLabel>
                <FormControl>
                  <Input
                    className='text-base'
                    type='number'
                    placeholder='Enter air temperature'
                    {...field}
                    value={field.value !== null ? field.value : ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : null
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='notes'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    className='text-base'
                    placeholder='Enter any additional notes'
                    {...field}
                    value={field.value !== null ? field.value : ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Catches</h3>
            {fields.map((field, index) => (
              <div
                key={field.id}
                className='grid gap-4 grid-cols-1 sm:grid-cols-2 p-4 border border-border rounded-md'
              >
                <FormField
                  control={form.control}
                  name={`fish_catches.${index}.fish_type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fish Type</FormLabel>
                      <FormControl>
                        <Input
                          className='text-base'
                          placeholder='Enter fish type'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`fish_catches.${index}.caught_on`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Caught on</FormLabel>
                      <FormControl>
                        <Input
                          className='text-base'
                          placeholder='Enter fly used'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`fish_catches.${index}.length`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Length (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='Enter fish length'
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseFloat(e.target.value) : null
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`fish_catches.${index}.weight`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (g)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='Enter fish weight'
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseFloat(e.target.value) : null
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type='button'
                  variant='destructive'
                  size='sm'
                  onClick={() => remove(index)}
                  className='w-full sm:col-span-2'
                >
                  <X className='mr-2 h-4 w-4' />
                  Remove Fish
                </Button>
              </div>
            ))}
            <Button
              type='button'
              variant='outline'
              onClick={() =>
                append({
                  fish_type: '',
                  caught_on: '',
                  length: undefined,
                  weight: undefined,
                })
              }
              className='w-full'
            >
              <PlusCircle className='mr-2 h-4 w-4' />
              Add Catch
            </Button>
          </div>
          <Button type='submit' disabled={loading} className='w-full'>
            {loading ? <LoadingSpinner fill='fill-primary' /> : 'Log Trip'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
