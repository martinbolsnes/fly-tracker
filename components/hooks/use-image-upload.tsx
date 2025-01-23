import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from '@/components/hooks/use-toast';
import { LoadingSpinner } from '@/app/components/loadingSpinner';

const BUCKET_NAME = 'trip-images';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const client = createClient();

  const uploadImage = async (file: File, userId: string, tripId: string) => {
    if (!file) return null;

    setUploading(true);
    try {
      toast({
        variant: 'default',
        title: 'Uploading image...',
        action: <LoadingSpinner fill='primary' />,
      });

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${tripId}/${Math.random()}.${fileExt}`;

      const { error: uploadError, data } = await client.storage
        .from(BUCKET_NAME)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      if (!data) throw new Error('Upload successful but no data returned');

      const {
        data: { publicUrl },
      } = client.storage.from(BUCKET_NAME).getPublicUrl(data.path);

      toast({
        title: 'Success! 🎉',
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
