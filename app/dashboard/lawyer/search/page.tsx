import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import VisaApprovalUploader from './VisaApprovalUploader';

export default async function LawyerSearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const query = searchParams?.q?.trim();

  let candidateData = null;
  let visaCase: any = null;
  let searchAttempted = false;

  if (query) {
    searchAttempted = true;
    // 1. Search candidate by public_code
    const { data: cand } = await supabase
      .from('candidates')
      .select('id, first_name, last_name, public_code, status, gender, city, created_at, photo_url')
      .ilike('public_code', query)
      .single();

    if (cand) {
      candidateData = cand;
      // 2. Fetch their active visa case if any
      const { data: vc } = await supabase
        .from('visa_cases')
        .select(`
          id, public_code, status, 
          job_offers(title), 
          employers(name, contact_email, public_code), 
          profiles!visa_cases_agent_id_fkey(email)
        `)
        .eq('candidate_id', cand.id)
        .order('opened_at', { ascending: false })
        .limit(1)
        .single();
        
      if (vc) {
        visaCase = vc;
      }
    }
  }

  return (
    <>
      <AppSidebar role="lawyer" />
      <div className="main">
        <AppTopbar section="Search Candidate" />
        <div className="wrap">
          <div className="page-head" style={{ marginBottom: '32px' }}>
            <div>
              <h1>Search Candidate</h1>
              <p className="ph-sub">Find a candidate by their unique ID (e.g., CND-2041).</p>
            </div>
          </div>

          <form className="card" style={{ padding: '24px', display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '32px', background: 'var(--card)', borderRadius: '16px' }}>
            <div style={{ flex: 1 }}>
              <input 
                type="text" 
                name="q" 
                defaultValue={query || ''} 
                placeholder="Enter Candidate ID..." 
                required
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '15px', color: 'var(--ink)', outline: 'none' }} 
              />
            </div>
            <button type="submit" className="btn btn-gold" style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: 600, fontSize: '14px' }}>
              Search
            </button>
            {query && (
              <Link href="/dashboard/lawyer/search">
                <button type="button" className="btn btn-outline" style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', color: 'var(--ink)' }}>
                  Clear
                </button>
              </Link>
            )}
          </form>

          {searchAttempted && !candidateData && (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--slate)', background: 'var(--card)' }}>
              No candidate found matching "{query}". Please check the ID and try again.
            </div>
          )}

          {candidateData && (
            <div className="card" style={{ padding: '32px', background: 'var(--card)', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '32px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: 'var(--brand-soft)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 600, overflow: 'hidden' }}>
                  {candidateData.photo_url ? (
                    <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/candidate-documents/${candidateData.photo_url}`} alt="Candidate" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    `${candidateData.first_name[0]}${candidateData.last_name[0]}`
                  )}
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                    {candidateData.first_name} {candidateData.last_name}
                  </h2>
                  <p style={{ color: 'var(--slate)', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>{candidateData.public_code}</p>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <span className="tag" style={{ background: '#f8fafc', color: 'var(--slate)' }}>{candidateData.gender}</span>
                    <span className="tag" style={{ background: '#f8fafc', color: 'var(--slate)' }}>{candidateData.city}</span>
                    <span className="tag" style={{ background: '#eef2ff', color: 'var(--brand)' }}>{candidateData.status.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <div style={{ height: '1px', background: 'var(--line)', margin: '24px 0' }}></div>

              {visaCase ? (
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink)', marginBottom: '16px' }}>Visa Case Details</h3>
                  <div className="resp-grid-2" style={{ marginBottom: '24px' }}>
                    <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--line)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--slate)', marginBottom: '4px' }}>Employer</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{visaCase.employers?.name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--slate)' }}>{visaCase.employers?.contact_email}</div>
                    </div>
                    <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--line)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--slate)', marginBottom: '4px' }}>Job Position</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{visaCase.job_offers?.title || 'Unknown Position'}</div>
                    </div>
                    <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--line)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--slate)', marginBottom: '4px' }}>Agent Email</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{visaCase.profiles?.email || 'Unknown'}</div>
                    </div>
                    <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--line)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--slate)', marginBottom: '4px' }}>Visa Case Status</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--brand)' }}>{visaCase.status.toUpperCase()}</div>
                    </div>
                  </div>

                  {/* Upload Visa Approval Action */}
                  <VisaApprovalUploader candidateId={candidateData.id} visaCaseId={visaCase.id} />
                </div>
              ) : (
                <div style={{ padding: '16px', background: '#fef1d8', color: '#b46d00', borderRadius: '12px', fontSize: '14px' }}>
                  This candidate has not been selected by an employer yet. No visa processing case exists.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
