import AppSidebar from '../../../../../components/AppSidebar';
import AppTopbar from '../../../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import EditClientForm from './EditClientForm';
import { notFound } from 'next/navigation';

export default async function EditCandidatePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const cndId = (await params).id;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch Candidate
  const { data: candidate } = await supabase
    .from('candidates')
    .select('*')
    .eq('public_code', cndId)
    .eq('agent_id', user.id)
    .single();

  if (!candidate) notFound();

  // Fetch Private Details
  const { data: privateDetails } = await supabase
    .from('candidate_private_details')
    .select('*')
    .eq('candidate_id', candidate.id)
    .single();

  // Fetch Candidate Positions
  const { data: candidatePositions } = await supabase
    .from('candidate_positions')
    .select('position_id')
    .eq('candidate_id', candidate.id);

  // Fetch Candidate Countries
  const { data: candidateCountries } = await supabase
    .from('candidate_countries')
    .select('country_id')
    .eq('candidate_id', candidate.id);
  
  candidate.country_ids = candidateCountries?.map(cc => cc.country_id) || [];

  // Fetch list of active countries
  const { data: dbCountries } = await supabase
    .from('countries')
    .select('id, name')
    .eq('is_active', true)
    .order('name');
  
  const countries = dbCountries || [];

  // Fetch list of active positions
  const { data: dbPositions } = await supabase
    .from('positions')
    .select('id, name')
    .eq('is_active', true)
    .order('name');
    
  const positionsList = dbPositions || [];

  return (
    <>
      <AppSidebar role="agent" />
      <div className="main">
        <AppTopbar section="Edit candidate" />
        <div className="wrap">
          <div className="page-head" style={{ marginBottom: '32px' }}>
            <h1>Edit candidate</h1>
            <p className="ph-sub">Update the information below to modify the candidate record.</p>
          </div>

          <div className="card" style={{ maxWidth: '800px' }}>
            <div className="card-b" style={{ padding: '32px' }}>
              <EditClientForm 
                countries={countries} 
                positions={positionsList} 
                candidate={candidate}
                privateDetails={privateDetails || {}}
                candidatePositions={candidatePositions || []}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
