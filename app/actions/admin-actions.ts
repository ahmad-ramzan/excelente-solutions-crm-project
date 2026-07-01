'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createCountry(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get('name') as string;
  const code = (formData.get('code') as string).toUpperCase();

  const { error } = await supabase.from('countries').insert({ name, code });
  if (error) return { error: error.message };

  revalidatePath('/dashboard/admin/countries');
  return { success: true };
}

export async function createPosition(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get('name') as string;

  const { error } = await supabase.from('positions').insert({ name });
  if (error) return { error: error.message };

  revalidatePath('/dashboard/admin/positions');
  return { success: true };
}

export async function updateUserStatus(userId: string, newStatus: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .update({ status: newStatus })
    .eq('id', userId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard/admin/users');
  return { success: true };
}
