import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from '@/components/hooks/use-toast';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';

const BUCKET_NAME = 'trip-images';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const client = createClient();

  const deleteExistingImage = async (imagePath: string) => {
    const { error } = await client.storage
      .from(BUCKET_NAME)
      .remove([imagePath]);
    if (error) {
      console.error('Error deleting existing image:', error);
      throw error;
    }
  };

  const uploadImage = async (file: File, userId: string, tripId: string) => {
    if (!file) return null;

    setUploading(true);

    try {
      toast({
        variant: 'default',
        title: 'Uploading image...',
        action: <LoadingSpinner fill='fill-primary' />,
      });
      // Fetch the current trip to get the existing image URL
      const { data: tripData, error: fetchError } = await client
        .from('fishing_trips')
        .select('image_url')
        .eq('id', tripId)
        .single();

      if (fetchError) throw fetchError;

      // Delete the existing image if there is one
      if (tripData?.image_url) {
        const existingImagePath = tripData.image_url
          .split(`${BUCKET_NAME}/`)
          .pop();
        if (existingImagePath) {
          await deleteExistingImage(existingImagePath);
        }
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${tripId}/${Math.random()}.${fileExt}`;

      const { error: uploadError, data } = await client.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, { upsert: true });

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

      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
        variant: 'default',
      });

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Failed',
        description: 'Failed to upload image. Please try again',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading };
}
