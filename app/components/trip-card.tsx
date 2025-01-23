import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  FishSymbol,
  CloudSunRain,
  Clock,
  Upload,
  Edit,
  Trash2,
} from 'lucide-react';
import { GiFishingPole } from 'react-icons/gi';
import { FishingTrip } from '../types';

interface TripCardProps {
  trip: FishingTrip;
  onImageUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    tripId: string
  ) => void;
  onEdit: (trip: FishingTrip) => void;
  onDelete: (id: string) => void;
}

export function TripCard({
  trip,
  onImageUpload,
  onEdit,
  onDelete,
}: TripCardProps) {
  return (
    <Card className='flex flex-col overflow-hidden border border-border'>
      <Link href={`/trips/${trip.id}`}>
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
          {/* {trip.fish_catches.length > 0 && (
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
          )} */}
        </div>
        {trip.notes && (
          <p className='mt-2 text-sm text-muted-foreground'>{trip.notes}</p>
        )}
      </CardContent>
      <CardFooter className='flex justify-between'>
        <label className='cursor-pointer'>
          <Input
            type='file'
            className='hidden'
            onChange={(e) => onImageUpload(e, trip.id)}
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
          <Button variant='secondary' size='sm' onClick={() => onEdit(trip)}>
            <Edit className='h-4 w-4 mr-2' />
            Edit
          </Button>
          <Button
            variant='destructive'
            size='sm'
            onClick={() => onDelete(trip.id)}
          >
            <Trash2 className='h-4 w-4 mr-2' />
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
