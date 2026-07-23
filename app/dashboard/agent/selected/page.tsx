import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import { getCandidateDocumentSignedUrls } from '@/app/lib/queries';
import Link from 'next/link';
import AgentDocumentManager from './AgentDocumentManager';

export default async function SelectedCandidatesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch selected/visa_processing candidates for this agent
  const { data: candidates } = await supabase
    .from('candidate_public_view')
    .select('*')
    .eq('agent_id', user.id)
    .neq('status', 'available')
    .order('created_at', { ascending: false });

  // Fetch their uploaded documents
  const candidateIds = (candidates || []).map(c => c.id);
  const documentsMap: Record<string, any[]> = {};

  if (candidateIds.length > 0) {
    const { data: docs } = await supabase
      .from('candidate_documents')
      .select('*')
      .in('candidate_id', candidateIds);

    docs?.forEach(d => {
      if (!documentsMap[d.candidate_id]) documentsMap[d.candidate_id] = [];
      documentsMap[d.candidate_id].push(d);
    });
  }

  // "candidate-documents" is a private bucket — every link needs a signed URL.
  const docUrls = await getCandidateDocumentSignedUrls(Object.values(documentsMap).flat().map(d => d.file_path));

  return (
    <>
      <AppSidebar role="agent" />
      <div className="main">
        <AppTopbar section="Selected Candidates" />
        <div className="wrap">
          <div className="page-head" style={{ marginBottom: '24px' }}>
            <div>
              <h1>Selected Candidates & Documents</h1>
              <p className="ph-sub">Manage post-selection documents and contracts.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {(!candidates || candidates.length === 0) && (
              <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--slate)' }}>
                No selected candidates found.
              </div>
            )}

            {candidates?.map((c) => (
              <div key={c.id} className="card" style={{ padding: '24px', background: 'var(--card)', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)' }}>{c.first_name} {c.last_name}</h3>
                    <p style={{ color: 'var(--slate)', fontSize: '13px', marginTop: '4px' }}>
                      Code: {c.public_code} &nbsp;|&nbsp; Status: <span style={{ fontWeight: 600, color: 'var(--brand)' }}>{c.status.toUpperCase()}</span>
                    </p>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--line)', paddingTop: '24px' }}>
                  <AgentDocumentManager candidateId={c.id} existingDocs={documentsMap[c.id] || []} docUrls={docUrls} />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
