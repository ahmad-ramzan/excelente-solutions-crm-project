'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function createCandidate(formData: FormData) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const gender = formData.get('gender') as string;
  const dateOfBirth = formData.get('dateOfBirth') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const isAnyCountry = formData.get('openToAllCountries') === 'on';
  const selectedCountries = formData.getAll('countries') as string[];
  const availableFrom = formData.get('availableFrom') as string;
  const availableUntil = formData.get('availableUntil') as string;
  const languagesStr = formData.get('languages') as string;
  const languages = languagesStr ? languagesStr.split(',').map(l => l.trim()).filter(l => l) : [];

  const city = formData.get('city') as string;
  const passportNumber = formData.get('passportNumber') as string;
  const passportExpiry = formData.get('passportExpiry') as string;

  // Selected positions
  const positions = formData.getAll('positions') as string[];

  if (positions.length > 3) {
    return { error: 'Candidate can apply for a maximum of 3 positions.' };
  }

  // Get current user (agent)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Insert Candidate
  const { data: candidate, error: candError } = await supabase
    .from('candidates')
    .insert({
      first_name: firstName,
      last_name: lastName,
      gender,
      city,
      open_to_all_countries: isAnyCountry,
      available_from: availableFrom || null,
      available_until: availableUntil || null,
      languages,
      agent_id: user.id,
      status: 'available',
    })
    .select('id')
    .single();

  if (candError) {
    console.error('Candidate insert error:', candError);

    let msg = candError.message;
    if (candError.code === '42501') {
      msg = 'Permission denied while creating the candidate. Your account may not have access to this action.';
    } else if (candError.code === '23502') {
      msg = `A required field is missing: ${candError.message}`;
    } else if (candError.code === '23503') {
      msg = 'A referenced record (agent) does not exist. Please sign out and back in, then try again.';
    } else if (!msg) {
      msg = 'Failed to create candidate.';
    }

    return { error: msg };
  }

  // Insert Private Details
  const { error: privError } = await supabase
    .from('candidate_private_details')
    .insert({
      candidate_id: candidate.id,
      date_of_birth: dateOfBirth,
      passport_number: passportNumber,
      passport_expiry: passportExpiry,
      contact_phone: phone,
      contact_email: email,
    });

  if (privError) {
    console.error('Private details error:', privError);
    // Note: in a production system we should handle rollback or use RPC, but Supabase doesn't easily support transactions from client APIs without RPC. 
  }

  // Insert Positions
  if (positions && positions.length > 0) {
    const positionInserts = positions.map(posId => ({
      candidate_id: candidate.id,
      position_id: posId
    }));

    const { error: positionError } = await adminClient.from('candidate_positions').insert(positionInserts);
    if (positionError) {
      console.error('Candidate positions insert error:', positionError);
      return { error: 'Failed to save candidate positions' };
    }
  }

  // Insert candidate_countries
  if (!isAnyCountry && selectedCountries.length > 0) {
    const countryInserts = selectedCountries.map(cId => ({
      candidate_id: candidate.id,
      country_id: cId
    }));
    const { error: countryError } = await adminClient.from('candidate_countries').insert(countryInserts);
    if (countryError) {
      console.error('Candidate countries insert error:', countryError);
      return { error: 'Failed to save candidate countries' };
    }
  }

  // Handle files
  const photo = formData.get('photo') as File;
  const cv = formData.get('cv') as File;

  const workExperienceFiles = formData.getAll('workExperience') as File[];

  // Function to upload a file directly to storage and return its path.
  // Uses the admin client — the "candidate-documents" bucket is private with no
  // storage RLS policies, so the regular session-scoped client can't write to it.
  const uploadToStorage = async (file: File, folder: string) => {
    if (!file || file.size === 0) return null;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = `${candidate.id}/${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const { data, error } = await adminClient.storage.from('candidate-documents').upload(filePath, buffer, { contentType: file.type, upsert: true });
    if (error) {
      console.error(`Error uploading ${folder}:`, error);
      return null;
    }
    return data.path;
  };

  let photoUrl = null;
  if (photo && photo.size > 0) {
    photoUrl = await uploadToStorage(photo, 'photos');
  }

  const workExpUploads: { path: string; file: File }[] = [];
  if (workExperienceFiles && workExperienceFiles.length > 0) {
    for (const f of workExperienceFiles) {
      const p = await uploadToStorage(f, 'work-experience');
      if (p) workExpUploads.push({ path: p, file: f });
    }
  }
  const workExpPaths = workExpUploads.map(u => u.path);

  if (photoUrl || workExpPaths.length > 0) {
    await supabase.from('candidates').update({
      photo_url: photoUrl,
      work_experience_files: workExpPaths
    }).eq('id', candidate.id);
  }

  // Also record photo/work-experience uploads as candidate_documents rows —
  // that's what the candidate detail page's Documents card and photo lookup
  // actually read from.
  const documentInserts: any[] = [];
  if (photoUrl) {
    documentInserts.push({
      candidate_id: candidate.id,
      type: 'photo',
      status: 'uploaded',
      file_path: photoUrl,
      file_name: photo.name,
      mime_type: photo.type,
      size_bytes: photo.size,
      uploaded_by: user.id
    });
  }
  workExpUploads.forEach(({ path, file }) => {
    documentInserts.push({
      candidate_id: candidate.id,
      type: 'work_experience',
      status: 'uploaded',
      file_path: path,
      file_name: file.name || 'Work experience file',
      mime_type: file.type,
      size_bytes: file.size,
      uploaded_by: user.id
    });
  });

  // Upload CV as a document record
  if (cv && cv.size > 0) {
    const cvPath = await uploadToStorage(cv, 'cvs');
    if (cvPath) {
      documentInserts.push({
        candidate_id: candidate.id,
        type: 'cv',
        status: 'uploaded',
        file_path: cvPath,
        file_name: cv.name,
        mime_type: cv.type,
        size_bytes: cv.size,
        uploaded_by: user.id
      });
    }
  }

  if (documentInserts.length > 0) {
    const { error: docsError } = await adminClient.from('candidate_documents').insert(documentInserts);
    if (docsError) {
      console.error('Candidate documents insert error:', docsError);
    }
  }

  revalidatePath('/dashboard/agent/candidates');
  revalidatePath('/dashboard/admin/candidates');
  revalidatePath('/dashboard/employer/candidates');
  revalidatePath('/dashboard/employer');

  return { success: true, candidateId: candidate.id };
}

export async function deleteCandidate(candidateId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('candidates')
    .delete()
    .match({ id: candidateId, agent_id: user.id });

  if (error) {
    console.error('Delete error', error);
    return { error: 'Failed to delete' };
  }

  revalidatePath('/dashboard/agent/candidates');
  revalidatePath('/dashboard/admin/candidates');
  revalidatePath('/dashboard/employer/candidates');
  revalidatePath('/dashboard/employer');

  return { success: true };
}

export async function updateCandidate(formData: FormData, candidateId: string) {
  const supabase = await createClient();
  const adminClient = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const gender = formData.get('gender') as string;
  const dateOfBirth = formData.get('dateOfBirth') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const city = formData.get('city') as string;
  const passportNumber = formData.get('passportNumber') as string;
  const passportExpiry = formData.get('passportExpiry') as string;

  const availableFrom = formData.get('availableFrom') as string;
  const availableUntil = formData.get('availableUntil') as string;

  const positions = formData.getAll('positions') as string[];

  if (positions.length > 3) {
    return { error: 'Candidate can apply for a maximum of 3 positions.' };
  }

  const isAnyCountry = formData.get('openToAllCountries') === 'on';
  const selectedCountries = formData.getAll('countries') as string[];

  const updatePayload: any = {
    first_name: firstName,
    last_name: lastName,
    gender,
    city,
    open_to_all_countries: isAnyCountry,
  };
  if (availableFrom) updatePayload.available_from = availableFrom;
  if (availableUntil) updatePayload.available_until = availableUntil;

  const { error: candError } = await supabase
    .from('candidates')
    .update(updatePayload)
    .match({ id: candidateId, agent_id: user.id });

  if (candError) {
    console.error('Candidate update error:', candError);
    return { error: 'Failed to update candidate' };
  }

  const { error: privError } = await supabase
    .from('candidate_private_details')
    .update({
      date_of_birth: dateOfBirth,
      passport_number: passportNumber,
      passport_expiry: passportExpiry,
      contact_phone: phone,
      contact_email: email,
    })
    .eq('candidate_id', candidateId);

  if (privError) {
    console.error('Private details update error:', privError);
  }

  if (positions) {
    const { error: deletePositionsError } = await adminClient.from('candidate_positions').delete().eq('candidate_id', candidateId);
    if (deletePositionsError) {
      console.error('Candidate positions delete error:', deletePositionsError);
      return { error: 'Failed to update candidate positions' };
    }

    if (positions.length > 0) {
      const positionInserts = positions.map(posId => ({
        candidate_id: candidateId,
        position_id: posId
      }));
      const { error: positionError } = await adminClient.from('candidate_positions').insert(positionInserts);
      if (positionError) {
        console.error('Candidate positions insert error:', positionError);
        return { error: 'Failed to update candidate positions' };
      }
    }
  }

  // Update candidate_countries
  const { error: deleteCountriesError } = await adminClient.from('candidate_countries').delete().eq('candidate_id', candidateId);
  if (deleteCountriesError) {
    console.error('Candidate countries delete error:', deleteCountriesError);
    return { error: 'Failed to update candidate countries' };
  }

  if (!isAnyCountry && selectedCountries && selectedCountries.length > 0) {
    const countryInserts = selectedCountries.map(cId => ({
      candidate_id: candidateId,
      country_id: cId
    }));
    const { error: countryError } = await adminClient.from('candidate_countries').insert(countryInserts);
    if (countryError) {
      console.error('Candidate countries insert error:', countryError);
      return { error: 'Failed to update candidate countries' };
    }
  }

  const photo = formData.get('photo') as File;
  const cv = formData.get('cv') as File;

  const uploadDoc = async (file: File, docType: string) => {
    if (!file || file.size === 0) return;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filePath = `${candidateId}/${docType}-${Date.now()}-${file.name}`;
    // Admin client — "candidate-documents" is a private bucket with no storage
    // RLS policies, so the regular session-scoped client can't write to it.
    const { error: uploadError } = await adminClient.storage
      .from('candidate-documents')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error(`Error uploading ${docType}:`, uploadError);
      return;
    }

    const { error: dbInsertError } = await adminClient.from('candidate_documents').insert({
      candidate_id: candidateId,
      type: docType,
      status: 'uploaded',
      file_path: filePath,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      uploaded_by: user.id
    });

    if (dbInsertError) {
      console.error('db insert error', dbInsertError);
    }
  };

  if (photo && photo.size > 0) await uploadDoc(photo, 'photo');
  if (cv && cv.size > 0) await uploadDoc(cv, 'cv');

  revalidatePath('/dashboard/agent/candidates');
  revalidatePath('/dashboard/admin/candidates');
  revalidatePath('/dashboard/employer/candidates');
  revalidatePath('/dashboard/employer');

  return { success: true };
}
