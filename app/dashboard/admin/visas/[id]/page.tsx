import AppSidebar from '../../../../components/AppSidebar';
import AppTopbar from '../../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import { getCandidateDocumentSignedUrls } from '@/app/lib/queries';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReassignLawyerForm from './ReassignLawyerForm';
import TravelCoordinationCard from '@/app/components/TravelCoordinationCard';

export default async function VisaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const caseId = (await params).id;

  const { data: vc } = await supabase
    .from('visa_cases')
    .select(`
      id, public_code, status, remarks, lawyer_id, country_id,
      application_reference, embassy_appointment_at, expected_decision_date, legal_notes, rejection_reason,
      candidates ( id, first_name, last_name, agent_id ),
      job_offer_selections ( job_offers ( employers ( name ) ) ),
      countries ( name, code )
    `)
    .eq('public_code', caseId)
    .single();

  if (!vc) notFound();

  const candidate: any = vc.candidates;
  const employer = (vc.job_offer_selections as any)?.job_offers?.employers?.name || 'Unknown';
  const country: any = vc.countries;

  const [{ data: agent }, { data: lawyer }, { data: docs }, { data: events }, { data: countryLawyers }, { data: docReqs }] = await Promise.all([
    candidate?.agent_id
      ? supabase.from('profiles').select('full_name').eq('id', candidate.agent_id).single()
      : Promise.resolve({ data: null }),
    vc.lawyer_id
      ? supabase.from('profiles').select('full_name').eq('id', vc.lawyer_id).single()
      : Promise.resolve({ data: null }),
    candidate?.id
      ? supabase.from('candidate_documents').select('*').eq('candidate_id', candidate.id).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    supabase.from('visa_case_events').select('*').eq('visa_case_id', vc.id).order('created_at', { ascending: false }),
    supabase
      .from('lawyer_countries')
      .select('lawyer_id, profiles(id, full_name, status)')
      .eq('country_id', vc.country_id),
    supabase.from('country_document_requirements').select('type').eq('country_id', vc.country_id),
  ]);

  // "candidate-documents" is a private bucket — every link needs a signed URL.
  const docUrls = await getCandidateDocumentSignedUrls((docs || []).map((d: any) => d.file_path));

  const { data: travel } = vc.status === 'approved'
    ? await supabase.from('visa_case_travel').select('*').eq('visa_case_id', vc.id).maybeSingle()
    : { data: null };

  const lawyerOptions = (countryLawyers || [])
    .map((lc: any) => lc.profiles)
    .filter((p: any) => p && p.status === 'active')
    .map((p: any) => ({ id: p.id, full_name: p.full_name }));

  const candidateDocs = (docs || []).filter(d => d.type !== 'visa_application_slip' && d.type !== 'approved_visa');
  const visaDocs = (docs || []).filter(d => d.type === 'visa_application_slip' || d.type === 'approved_visa');

  const name = candidate ? `${candidate.first_name} ${candidate.last_name}` : 'Unknown candidate';
  const initials = candidate ? `${candidate.first_name?.[0] || ''}${candidate.last_name?.[0] || ''}`.toUpperCase() : '--';

  const getStatusProps = (s: string) => {
    switch (s) {
      case 'approved': return { bg: '#dcf4e6', color: '#008a3d' };
      case 'pending':
      case 'documents_requested':
      case 'additional_documents_requested': return { bg: '#f6ebd7', color: '#b46d00' };
      case 'documents_received':
      case 'documents_under_review':
      case 'ready_for_submission': return { bg: '#e0e7ff', color: '#3730a3' };
      case 'submitted':
      case 'appointment_scheduled':
      case 'biometrics_required':
      case 'under_immigration_review': return { bg: '#fef1d8', color: '#b46d00' };
      case 'on_hold': return { bg: '#f1f5f9', color: '#475569' };
      case 'rejected': return { bg: '#fee2e2', color: '#b91c1c' };
      default: return { bg: 'var(--line-2)', color: 'var(--slate)' };
    }
  };
  const statusProps = getStatusProps(vc.status);

  const getDocIcon = (mime: string) => {
    if (mime?.includes('image')) return { color: 'var(--brand)', bg: 'var(--brand-soft)', border: 'var(--brand-soft)' };
    return { color: 'var(--red)', bg: '#fee2e2', border: '#fecaca' };
  };
  const getDocFormat = (mime: string, path: string) => {
    if (mime?.includes('pdf')) return 'PDF';
    if (mime?.includes('image')) return 'IMG';
    return path.split('.').pop()?.toUpperCase() || 'FILE';
  };

  return (
    <>
      <AppSidebar role="admin" />
      <div className="main">
        <AppTopbar section={caseId} />
        <div className="wrap">
          <div style={{ marginBottom: '24px' }}>
            <Link href="/dashboard/admin/visas">
              <button className="btn btn-ghost btn-sm" style={{ padding: '6px 12px', fontSize: '12px' }}>
                ← Back to cases
              </button>
            </Link>
          </div>

          <div className="page-head" style={{ marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '32px' }}>{name}</h1>
              <p className="ph-sub" style={{ fontSize: '13.5px', marginTop: '6px' }}>
                Case: {vc.public_code} · {employer} · {country?.name || 'Unknown'} <span className="chip" style={{ background: 'var(--ink)', color: '#fff', padding: '2px 6px', fontSize: '10px', marginLeft: '4px', border: 'none' }}>{country?.code}</span>
              </p>
            </div>
          </div>

          <div className="grid-2">
            <div className="split-col">
              {/* Profile Card */}
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px' }}>
                <div className="av-sm" style={{ width: '48px', height: '48px', fontSize: '16px', background: 'var(--brand-soft)', color: 'var(--brand)', borderRadius: '12px' }}>
                  {initials}
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', marginBottom: '2px' }}>{name}</h3>
                  <div style={{ fontSize: '12.5px', color: 'var(--slate)', marginBottom: '8px' }}>
                    Agent: {agent?.full_name || 'Unassigned'} · {employer}
                  </div>
                  <span className="tag" style={{ background: statusProps.bg, color: statusProps.color, border: 'none', lineHeight: '1.2' }}>• {vc.status.replace(/_/g, ' ').toUpperCase()}</span>
                </div>
              </div>

              {/* Candidate Documents */}
              <div className="card">
                <div className="card-h">
                  <h3>Candidate documents</h3>
                  <span className="chip" style={{ background: '#e5f6ed', color: '#109856', border: 'none', fontSize: '10px', fontWeight: 700 }}>↑ FROM AGENT</span>
                </div>
                <div className="card-b" style={{ padding: '0 22px' }}>
                  {candidateDocs.map(d => {
                    const style = getDocIcon(d.mime_type);
                    return (
                      <div key={d.id} className="doc">
                        <div className="dic" style={{ color: style.color, background: style.bg, borderColor: style.border }}>{getDocFormat(d.mime_type, d.file_path)}</div>
                        <div>
                          <div className="dnm" style={{ textTransform: 'capitalize' }}>{d.type.replace(/_/g, ' ')}</div>
                          <div className="dmeta">{d.file_name}</div>
                        </div>
                        <div className="dright">
                          <a href={docUrls[d.file_path] || '#'} target="_blank" rel="noopener noreferrer">
                            <button className="ico-btn">↓</button>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                  {candidateDocs.length === 0 && (
                    <div style={{ padding: '20px 0', fontSize: '13px', color: 'var(--muted)' }}>No documents uploaded yet.</div>
                  )}
                </div>
              </div>

              {/* Visa Documents */}
              <div className="card">
                <div className="card-h">
                  <h3>Visa documents</h3>
                  <span className="chip" style={{ background: '#fff0db', color: '#b46d00', border: 'none', fontSize: '10px', fontWeight: 700 }}>↑ FROM LAWYER</span>
                </div>
                <div className="card-b" style={{ padding: '0 22px' }}>
                  {visaDocs.map(d => {
                    const style = getDocIcon(d.mime_type);
                    return (
                      <div key={d.id} className="doc">
                        <div className="dic" style={{ color: style.color, background: style.bg, borderColor: style.border }}>{getDocFormat(d.mime_type, d.file_path)}</div>
                        <div>
                          <div className="dnm" style={{ textTransform: 'capitalize' }}>{d.type.replace(/_/g, ' ')}</div>
                          <div className="dmeta">{d.file_name}</div>
                        </div>
                        <div className="dright">
                          <a href={docUrls[d.file_path] || '#'} target="_blank" rel="noopener noreferrer">
                            <button className="ico-btn">↓</button>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                  {visaDocs.length === 0 && (
                    <div style={{ padding: '20px 0', fontSize: '13px', color: 'var(--muted)' }}>No visa documents yet.</div>
                  )}
                </div>
              </div>

              {/* Status history */}
              <div className="card">
                <div className="card-h">
                  <h3>Status history</h3>
                </div>
                <div className="card-b" style={{ padding: '0 22px' }}>
                  {(events || []).map(e => (
                    <div key={e.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)', textTransform: 'capitalize' }}>{e.status.replace(/_/g, ' ')}</div>
                      {e.remarks && <div style={{ fontSize: '12.5px', color: 'var(--slate)', marginTop: '2px' }}>{e.remarks}</div>}
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>{new Date(e.created_at).toLocaleString()}</div>
                    </div>
                  ))}
                  {(!events || events.length === 0) && (
                    <div style={{ padding: '20px 0', fontSize: '13px', color: 'var(--muted)' }}>No status changes recorded yet.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="split-col">
              {/* Parties */}
              <div className="card">
                <div className="card-h">
                  <h3>Parties</h3>
                </div>
                <div className="card-b" style={{ padding: '4px 0' }}>
                  <div className="kv" style={{ padding: '0 22px' }}>
                    <div className="r">
                      <div className="k">Candidate</div>
                      <div className="v">{name}</div>
                    </div>
                    <div className="r">
                      <div className="k">Agent</div>
                      <div className="v">{agent?.full_name || 'Unassigned'}</div>
                    </div>
                    <div className="r">
                      <div className="k">Employer</div>
                      <div className="v">{employer}</div>
                    </div>
                    <div className="r">
                      <div className="k">Lawyer</div>
                      <div className="v">{lawyer?.full_name || 'Unassigned'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Application details */}
              {(vc.application_reference || vc.embassy_appointment_at || vc.expected_decision_date || vc.legal_notes || vc.rejection_reason) && (
                <div className="card">
                  <div className="card-h">
                    <h3>Application details</h3>
                  </div>
                  <div className="card-b" style={{ padding: '4px 0' }}>
                    <div className="kv" style={{ padding: '0 22px' }}>
                      {vc.application_reference && (
                        <div className="r">
                          <div className="k">Reference no.</div>
                          <div className="v">{vc.application_reference}</div>
                        </div>
                      )}
                      {vc.embassy_appointment_at && (
                        <div className="r">
                          <div className="k">Embassy appointment</div>
                          <div className="v">{new Date(vc.embassy_appointment_at).toLocaleString()}</div>
                        </div>
                      )}
                      {vc.expected_decision_date && (
                        <div className="r">
                          <div className="k">Expected decision</div>
                          <div className="v">{vc.expected_decision_date}</div>
                        </div>
                      )}
                    </div>
                    {vc.legal_notes && (
                      <div style={{ padding: '14px 22px', borderTop: '1px solid var(--line)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginBottom: '4px' }}>LEGAL NOTES</div>
                        <div style={{ fontSize: '13px', color: 'var(--slate)' }}>{vc.legal_notes}</div>
                      </div>
                    )}
                    {vc.rejection_reason && (
                      <div style={{ padding: '14px 22px', borderTop: '1px solid #fecaca', background: '#fef2f2' }}>
                        <div style={{ fontSize: '11px', color: '#b91c1c', fontWeight: 600, marginBottom: '4px' }}>REJECTION REASON</div>
                        <div style={{ fontSize: '13px', color: '#b91c1c' }}>{vc.rejection_reason}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Lawyer assignment */}
              <div className="card">
                <div className="card-h">
                  <h3>{vc.lawyer_id ? 'Reassign lawyer' : 'Assign lawyer'}</h3>
                </div>
                <div className="card-b" style={{ padding: '22px' }}>
                  {lawyerOptions.length === 0 ? (
                    <div style={{ fontSize: '13px', color: 'var(--muted)' }}>No active lawyers are assigned to {country?.name || 'this country'} yet.</div>
                  ) : (
                    <ReassignLawyerForm visaCaseId={vc.id} currentLawyerId={vc.lawyer_id} lawyers={lawyerOptions} />
                  )}
                </div>
              </div>

              {/* Travel coordination — only relevant once the visa is approved */}
              {vc.status === 'approved' && (
                <TravelCoordinationCard visaCaseId={vc.id} travel={travel} />
              )}

              {/* Country visa requirements */}
              <div className="card">
                <div className="card-h">
                  <h3>{country?.name || 'Country'} visa requirements</h3>
                </div>
                <div className="card-b" style={{ padding: '18px 22px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--slate)', lineHeight: 1.5, marginBottom: '16px' }}>
                    Requirements are configured per country, as other markets may need different documents.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {(docReqs || []).map(r => (
                      <span key={r.type} className="chip" style={{ fontSize: '10.5px' }}>#{r.type.replace(/_/g, ' ')}</span>
                    ))}
                    {(!docReqs || docReqs.length === 0) && (
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>No requirements configured.</span>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
