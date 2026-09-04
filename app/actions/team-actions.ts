'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' } as const;

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { error: 'Only admins can manage the team section' } as const;

  return { user } as const;
}

function revalidateTeamPaths() {
  revalidatePath('/');
  revalidatePath('/dashboard/admin/team');
}

export async function createTeamMember(formData: FormData) {
  const auth = await requireAdmin();
  if ('error' in auth) return { error: auth.error };

  const name = (formData.get('name') as string)?.trim();
  const position = (formData.get('position') as string)?.trim();
  const photo = formData.get('photo') as File | null;
  const displayOrder = parseInt(formData.get('displayOrder') as string, 10) || 0;

  if (!name || !position) {
    return { error: 'Name and position are required' };
  }

  const adminClient = createAdminClient();

  let photoPath: string | null = null;
  if (photo && photo.size > 0) {
    const buffer = Buffer.from(await photo.arrayBuffer());
    photoPath = `${Date.now()}-${photo.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const { error: uploadError } = await adminClient.storage
      .from('team-photos')
      .upload(photoPath, buffer, { contentType: photo.type, upsert: true });

    if (uploadError) {
      console.error('Team photo upload error:', uploadError);
      return { error: 'Failed to upload photo' };
    }
  }

  const { error } = await adminClient.from('team_members').insert({
    name,
    position,
    photo_path: photoPath,
    display_order: displayOrder,
  });

  if (error) {
    console.error('Team member insert error:', error);
    return { error: 'Failed to add team member' };
  }

  revalidateTeamPaths();
  return { success: true };
}

export async function updateTeamMember(memberId: string, formData: FormData) {
  const auth = await requireAdmin();
  if ('error' in auth) return { error: auth.error };

  const name = (formData.get('name') as string)?.trim();
  const position = (formData.get('position') as string)?.trim();
  const photo = formData.get('photo') as File | null;
  const displayOrder = parseInt(formData.get('displayOrder') as string, 10) || 0;

  if (!name || !position) {
    return { error: 'Name and position are required' };
  }

  const adminClient = createAdminClient();

  const updatePayload: Record<string, unknown> = { name, position, display_order: displayOrder };

  if (photo && photo.size > 0) {
    const { data: existing } = await adminClient.from('team_members').select('photo_path').eq('id', memberId).maybeSingle();

    const buffer = Buffer.from(await photo.arrayBuffer());
    const photoPath = `${Date.now()}-${photo.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const { error: uploadError } = await adminClient.storage
      .from('team-photos')
      .upload(photoPath, buffer, { contentType: photo.type, upsert: true });

    if (uploadError) {
      console.error('Team photo upload error:', uploadError);
      return { error: 'Failed to upload photo' };
    }

    updatePayload.photo_path = photoPath;

    if (existing?.photo_path) {
      await adminClient.storage.from('team-photos').remove([existing.photo_path]);
    }
  }

  const { error } = await adminClient.from('team_members').update(updatePayload).eq('id', memberId);

  if (error) {
    console.error('Team member update error:', error);
    return { error: 'Failed to update team member' };
  }

  revalidateTeamPaths();
  return { success: true };
}

export async function deleteTeamMember(memberId: string) {
  const auth = await requireAdmin();
  if ('error' in auth) return { error: auth.error };

  const adminClient = createAdminClient();

  const { data: existing } = await adminClient.from('team_members').select('photo_path').eq('id', memberId).maybeSingle();

  const { error } = await adminClient.from('team_members').delete().eq('id', memberId);

  if (error) {
    console.error('Team member delete error:', error);
    return { error: 'Failed to delete team member' };
  }

  if (existing?.photo_path) {
    await adminClient.storage.from('team-photos').remove([existing.photo_path]);
  }

  revalidateTeamPaths();
  return { success: true };
}
