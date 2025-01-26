'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
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
import { FishingTrip } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { PlusCircle } from 'lucide-react';

const fishCatchSchema = z.object({
  id: z.string().optional(),
  fish_type: z.string().min(1, 'Fish type is required'),
  caught_on: z.string().optional(),
  length: z.number().nullable().optional(),
  weight: z.number().nullable().optional(),
});

const formSchema = z.object({
  location: z.string().min(2, {
    message: 'Location must be at least 2 characters.',
  }),
  date: z.string(),
  time_of_day: z.string(),
  weather: z.string(),
  notes: z.string().nullable(),
  catch_count: z.number(),
  water_temperature: z.number().nullable().optional(),
  air_temperature: z.number().nullable().optional(),
  fish_catches: z.array(fishCatchSchema),
});

interface EditTripFormProps {
  trip: FishingTrip | null;
  onSave: (updatedTrip: FishingTrip) => void;
}

export function EditTripForm({ trip, onSave }: EditTripFormProps) {
  const [loading, setLoading] = useState(false);
  const client = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: trip?.location || '',
      date: trip?.date || '',
      time_of_day: trip?.time_of_day || '',
      weather: trip?.weather || '',
      notes: trip?.notes || '',
      catch_count: trip?.catch_count || 0,
      water_temperature: trip?.water_temperature || null,
      air_temperature: trip?.air_temperature || null,
      fish_catches: trip?.fish_catches || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'fish_catches',
  });

  useEffect(() => {
    if (trip) {
      form.reset({
        location: trip.location,
        date: trip.date,
        time_of_day: trip.time_of_day,
        weather: trip.weather,
        notes: trip.notes,
        catch_count: trip.catch_count,
        water_temperature: trip.water_temperature,
        air_temperature: trip.air_temperature,
        fish_catches: trip?.fish_catches,
      });
    }
  }, [trip, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!trip) return;

    setLoading(true);
    try {
      const { data, error } = await client
        .from('fishing_trips')
        .update({
          location: values.location,
          date: values.date,
          time_of_day: values.time_of_day,
          weather: values.weather,
          notes: values.notes,
          catch_count: values.fish_catches.length,
          water_temperature: values.water_temperature,
          air_temperature: values.air_temperature,
        })
        .eq('id', trip.id)
        .select();

      if (error) throw error;

      // Update fish catches
      await Promise.all(
        values.fish_catches.map(async (fishCatch) => {
          if (fishCatch.id) {
            // Update existing fish catch
            await client
              .from('fish_catches')
              .update(fishCatch)
              .eq('id', fishCatch.id);
          } else {
            // Insert new fish catch
            await client
              .from('fish_catches')
              .insert({ ...fishCatch, trip_id: trip.id });
          }
        })
      );

      // Delete removed fish catches
      const removedFishCatches = trip.fish_catches.filter(
        (oldCatch) =>
          !values.fish_catches.some((newCatch) => newCatch.id === oldCatch.id)
      );
      await Promise.all(
        removedFishCatches.map(async (fishCatch) => {
          await client.from('fish_catches').delete().eq('id', fishCatch.id);
        })
      );

      if (data && data[0]) {
        const updatedTrip: FishingTrip = {
          ...data[0],
          fish_catches: values.fish_catches,
        };
        onSave(updatedTrip);
        toast({
          title: 'Success',
          description: 'Trip updated successfully',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error updating trip:', error);
      toast({
        title: 'Error',
        description: 'Failed to update trip. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  if (!trip) return null;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col space-y-6'
      >
        <div className='flex items-center space-x-4'>
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
                  <Input className='text-base' type='date' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
                    <SelectItem value='Partly Cloudy'>Partly Cloudy</SelectItem>
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
        <div className='flex items-center space-x-4'>
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
                    {...field}
                    value={field.value !== null ? field.value : ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : ''
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
                    {...field}
                    value={field.value !== null ? field.value : ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : ''
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name='notes'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Enter any additional notes about the trip'
                  className='resize-none text-base'
                  {...field}
                  value={field.value !== null ? field.value : ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <h3 className='text-lg font-semibold mb-2'>Catches</h3>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className='grid gap-4 grid-cols-1 sm:grid-cols-2'
            >
              <FormField
                control={form.control}
                name={`fish_catches.${index}.fish_type`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fish Type</FormLabel>
                    <FormControl>
                      <Input className='text-base' {...field} />
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
                    <FormLabel>Caught On</FormLabel>
                    <FormControl>
                      <Input className='text-base' {...field} />
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
                        className='text-base'
                        type='number'
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseFloat(e.target.value) : ''
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
                        className='text-base'
                        type='number'
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseFloat(e.target.value) : ''
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
                variant='secondary'
                className='bg-destructive/60'
                onClick={() => remove(index)}
              >
                Remove Catch
              </Button>
            </div>
          ))}
          <Button
            type='button'
            className='mt-2'
            variant='outline'
            onClick={() =>
              append({
                fish_type: '',
                caught_on: '',
                length: undefined,
                weight: undefined,
              })
            }
          >
            <PlusCircle className='mr-2 h-4 w-4' />
            Add Catch
          </Button>
        </div>
        <Button type='submit' disabled={loading}>
          {loading ? <LoadingSpinner fill='fill-primary' /> : 'Update Trip'}
        </Button>
      </form>
    </Form>
  );
}
