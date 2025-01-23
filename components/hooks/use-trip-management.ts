import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from '@/components/hooks/use-toast';
import { FishingTrip } from '../../app/types';

export function useTripManagement() {
  const [trips, setTrips] = useState<FishingTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<keyof FishingTrip>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterLocation, setFilterLocation] = useState('');
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

  const deleteTrip = async (id: string) => {
    try {
      const { error } = await client
        .from('fishing_trips')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTrips(trips.filter((trip) => trip.id !== id));
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
    }
  };

  return {
    trips: sortedAndFilteredTrips,
    loading,
    error,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filterLocation,
    setFilterLocation,
    deleteTrip,
    fetchTrips,
  };
}
