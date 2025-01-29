'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateUserProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const username = formData.get('username') as string;
  const short_bio = formData.get('short_bio') as string;
  const avatar = formData.get('avatar') as File | null;

  let avatar_url = null;
  if (avatar) {
    const fileExt = avatar.name.split('.').pop();
    const filePath = `${user.id}/${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatar);

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    if (!publicUrlData) {
      throw new Error('Error getting public URL');
    }

    avatar_url = publicUrlData.publicUrl;
  }

  const updateData: any = { username, short_bio };
  if (avatar_url) {
    updateData.avatar_url = avatar_url;
  }

  const { data: updatedProfile, error: updateError } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating profile:', updateError);
    throw updateError;
  }

  revalidatePath('/profile');
  return updatedProfile;
}
