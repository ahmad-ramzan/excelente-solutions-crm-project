import AppSidebar from '../../../../components/AppSidebar';
import AppTopbar from '../../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import ClientCaseStatusForm from './ClientCaseStatusForm';
import ClientDocumentUpload from './ClientDocumentUpload';

export default async function LawyerCaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch Case Details
  const { data: caseData } = await supabase
    .from('visa_cases')
    .select(`
      id,
      public_code,
      status,
      remarks,
      application_reference,
      embassy_appointment_at,
      expected_decision_date,
      legal_notes,
      rejection_reason,
      opened_at,
      candidate_id,
      candidates (
        public_code, first_name, last_name, gender, nationality,
        candidate_private_details ( passport_number )
      ),
      employers ( name ),
      countries ( name )
    `)
    .eq('public_code', id)
    .single();

  if (!caseData) {
    redirect('/dashboard/lawyer/cases');
  }

  // Fetch Case Events
  const { data: events } = await supabase
    .from('visa_case_events')
    .select('id, status, remarks, created_at, profiles(raw_user_meta_data)')
    .eq('visa_case_id', caseData.id)
    .order('created_at', { ascending: false });

  // Fetch Candidate Documents
  const { data: documents } = await supabase
    .from('candidate_documents')
    .select('id, type, file_name, file_path, status, created_at')
    .eq('candidate_id', caseData.candidate_id)
    .order('created_at', { ascending: false });

  const c = caseData.candidates as any;
  const candidateName = `${c?.first_name} ${c?.last_name}`;
  const employerName = (caseData.employers as any)?.name;
  const privateDetails = Array.isArray(c?.candidate_private_details) ? c.candidate_private_details[0] : c?.candidate_private_details;
  const passportNumber = privateDetails?.passport_number;

  return (
    <>
      <AppSidebar role="lawyer" />
      <div className="main">
        <AppTopbar section="Case Details" />
        <div className="wrap" style={{ maxWidth: '1000px' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <Link href="/dashboard/lawyer/cases" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--slate)', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}>
              <span>←</span> Back to cases
            </Link>
          </div>

          <div className="page-head" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                Case {caseData.public_code}
                <span className="tag" style={{ 
                  background: caseData.status === 'approved' ? '#dcf4e6' : caseData.status === 'rejected' ? '#ffe4e6' : '#fef1d8',
                  color: caseData.status === 'approved' ? '#008a3d' : caseData.status === 'rejected' ? '#e11d48' : '#b46d00', 
                  border: 'none',
                  fontSize: '11px'
                }}>
                  • {caseData.status.replace('_', ' ').toUpperCase()}
                </span>
              </h1>
              <p className="ph-sub">Candidate: {candidateName} ({c?.public_code}) · Employer: {employerName}</p>
            </div>
          </div>

          <div className="content-with-sidebar" style={{ gridTemplateColumns: '1fr 340px' }}>
            
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Candidate Info */}
              <div className="card">
                <div className="card-h">
                  <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Candidate Details</h3>
                </div>
                <div className="card-b">
                  <div className="resp-grid-2" style={{ marginBottom: 0 }}>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '4px' }}>Full Name</div>
                      <div style={{ fontSize: '14.5px', color: 'var(--ink)' }}>{candidateName}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '4px' }}>Passport No.</div>
                      <div style={{ fontSize: '14.5px', color: 'var(--ink)' }}>{passportNumber || 'N/A'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '4px' }}>Nationality</div>
                      <div style={{ fontSize: '14.5px', color: 'var(--ink)' }}>{c?.nationality}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '4px' }}>Gender</div>
                      <div style={{ fontSize: '14.5px', color: 'var(--ink)', textTransform: 'capitalize' }}>{c?.gender}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="card">
                <div className="card-h">
                  <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Documents</h3>
                </div>
                <div className="card-b" style={{ padding: 0 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {(documents || []).map((doc, i) => (
                        <tr key={doc.id} style={{ borderBottom: i === (documents?.length || 0) - 1 ? 'none' : '1px solid var(--line)' }}>
                          <td style={{ padding: '16px 22px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '36px', height: '36px', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate)' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                              </div>
                              <div>
                                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ink)' }}>{doc.file_name}</div>
                                <div style={{ fontSize: '12px', color: 'var(--slate)', textTransform: 'capitalize' }}>{doc.type.replace('_', ' ')} • Uploaded {new Date(doc.created_at).toLocaleDateString()}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px 22px', textAlign: 'right' }}>
                            <Link href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/candidate-documents/${doc.file_path}`} target="_blank" rel="noopener noreferrer">
                              <button className="btn" style={{ background: '#fff', border: '1px solid var(--line-2)', color: 'var(--ink)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                                View
                              </button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {(!documents || documents.length === 0) && (
                        <tr>
                          <td style={{ padding: '32px', textAlign: 'center', color: 'var(--slate)' }}>
                            No documents uploaded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  
                  <div style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', background: 'var(--paper)' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '12px' }}>Upload new document</h4>
                    <ClientDocumentUpload visaCaseId={caseData.id} candidateId={caseData.candidate_id} />
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Update Status */}
              <div className="card">
                <div className="card-h">
                  <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Update Case Status</h3>
                </div>
                <div className="card-b">
                  <ClientCaseStatusForm
                    visaCaseId={caseData.id}
                    currentStatus={caseData.status}
                    currentRemarks={caseData.remarks || ''}
                    currentApplicationReference={caseData.application_reference}
                    currentEmbassyAppointmentAt={caseData.embassy_appointment_at}
                    currentExpectedDecisionDate={caseData.expected_decision_date}
                    currentLegalNotes={caseData.legal_notes}
                    currentRejectionReason={caseData.rejection_reason}
                  />
                </div>
              </div>

              {/* History */}
              <div className="card">
                <div className="card-h">
                  <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Case History</h3>
                </div>
                <div className="card-b">
                  <div style={{ position: 'relative', paddingLeft: '20px' }}>
                    <div style={{ position: 'absolute', top: '8px', bottom: '8px', left: '6px', width: '2px', background: 'var(--line-2)' }}></div>
                    
                    {(events || []).map((e, i) => (
                      <div key={e.id} style={{ position: 'relative', marginBottom: i === (events?.length || 0) - 1 ? 0 : '24px' }}>
                        <div style={{ position: 'absolute', left: '-19px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--brand)', border: '2px solid #fff' }}></div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                          Status changed to: <span style={{ textTransform: 'capitalize' }}>{e.status.replace('_', ' ')}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--slate)', marginTop: '2px' }}>
                          {new Date(e.created_at).toLocaleString()}
                        </div>
                        {e.remarks && (
                          <div style={{ fontSize: '13px', color: 'var(--slate)', marginTop: '6px', padding: '8px 12px', background: 'var(--paper)', borderRadius: '6px', border: '1px solid var(--line-2)' }}>
                            "{e.remarks}"
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <div style={{ position: 'relative', marginTop: (events?.length || 0) > 0 ? '24px' : 0 }}>
                      <div style={{ position: 'absolute', left: '-19px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--line)', border: '2px solid #fff' }}></div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Case Opened</div>
                      <div style={{ fontSize: '12px', color: 'var(--slate)', marginTop: '2px' }}>
                        {new Date(caseData.opened_at).toLocaleString()}
                      </div>
                    </div>

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
