import AppSidebar from '../../../../../components/AppSidebar';
import AppTopbar from '../../../../../components/AppTopbar';
import { createClient, getAuthUser } from '@/utils/supabase/server';
import { getOpenVacancyPositions } from '@/app/lib/queries';
import EditClientForm from './EditClientForm';
import { notFound } from 'next/navigation';

export default async function EditCandidatePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const cndId = (await params).id;

  const user = await getAuthUser();
  if (!user) return null;

  // Fetch Candidate
  const { data: candidate } = await supabase
    .from('candidates')
    .select('*')
    .eq('public_code', cndId)
    .eq('agent_id', user.id)
    .single();

  if (!candidate) notFound();

  // All independent of each other (and of the candidate lookup above) — fetch concurrently.
  const [
    { data: privateDetails },
    { data: candidatePositions },
    { data: candidateCountries },
    { data: dbCountries },
    { data: dbPositions },
    vacancyPositions,
  ] = await Promise.all([
    supabase.from('candidate_private_details').select('*').eq('candidate_id', candidate.id).single(),
    supabase.from('candidate_positions').select('position_id').eq('candidate_id', candidate.id),
    supabase.from('candidate_countries').select('country_id').eq('candidate_id', candidate.id),
    supabase.from('countries').select('id, name').eq('is_active', true).order('name'),
    supabase.from('positions').select('id, name').eq('is_active', true).order('name'),
    getOpenVacancyPositions(supabase),
  ]);

  candidate.country_ids = candidateCountries?.map(cc => cc.country_id) || [];

  const countries = dbCountries || [];
  const positionsList = dbPositions || [];

  return (
    <>
      <AppSidebar role="agent" />
      <div className="main">
        <AppTopbar section="Edit candidate" role="agent" />
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
                vacancyPositions={vacancyPositions}
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
