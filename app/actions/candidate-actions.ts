'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createCandidate(formData: FormData) {
  const supabase = await createClient();

  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const gender = formData.get('gender') as string;
  const dateOfBirth = formData.get('dateOfBirth') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const address = formData.get('address') as string;
  
  const countryId = formData.get('countryId') as string;
  const city = formData.get('city') as string;
  const passportNumber = formData.get('passportNumber') as string;
  const passportExpiry = formData.get('passportExpiry') as string;

  // Selected positions
  const positions = formData.getAll('positions') as string[];

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
      country_id: countryId,
      agent_id: user.id,
      status: 'available',
    })
    .select('id')
    .single();

  if (candError) {
    console.error('Candidate insert error:', candError);
    return { error: 'Failed to create candidate' };
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
    
    await supabase.from('candidate_positions').insert(positionInserts);
  }

  // Handle files
  const photo = formData.get('photo') as File;
  const cv = formData.get('cv') as File;

  // Function to upload a document
  const uploadDoc = async (file: File, docType: string) => {
    if (!file || file.size === 0) return;
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filePath = `${candidate.id}/${docType}-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('candidate-documents')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });
      
    if (uploadError) {
      console.error(`Error uploading ${docType}:`, uploadError);
      require('fs').appendFileSync('upload-debug.log', JSON.stringify({ type: 'upload_error', docType, error: uploadError }) + '\\n');
      return;
    }

    const { error: dbInsertError } = await supabase.from('candidate_documents').insert({
      candidate_id: candidate.id,
      type: docType,
      status: 'uploaded',
      file_path: filePath,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      uploaded_by: user.id
    });
    if (dbInsertError) {
      require('fs').appendFileSync('upload-debug.log', JSON.stringify({ type: 'db_insert_error', docType, error: dbInsertError }) + '\\n');
    }
  };

  if (photo) await uploadDoc(photo, 'photo');
  if (cv) await uploadDoc(cv, 'cv');

  revalidatePath('/dashboard/agent/candidates');
  revalidatePath('/dashboard/admin/candidates');
  revalidatePath('/dashboard/employer/candidates');
  revalidatePath('/dashboard/employer');

  return { success: true, candidateId: candidate.id };
}
