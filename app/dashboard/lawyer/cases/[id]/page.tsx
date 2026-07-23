import AppSidebar from '../../../../components/AppSidebar';
import AppTopbar from '../../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import { getCandidateDocumentSignedUrls } from '@/app/lib/queries';
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
    .select('id, type, file_name, file_path, mime_type, size_bytes, status, created_at')
    .eq('candidate_id', caseData.candidate_id)
    .order('created_at', { ascending: false });

  const getDocIcon = (mime?: string) => {
    if (mime?.includes('image')) return { color: 'var(--brand)', bg: 'var(--brand-soft)' };
    return { color: 'var(--red)', bg: '#fee2e2' };
  };

  const getDocFormat = (mime: string | undefined, path: string) => {
    if (mime?.includes('pdf')) return 'PDF';
    if (mime?.includes('image')) return 'IMG';
    const ext = path.split('.').pop()?.toUpperCase();
    return ext || 'FILE';
  };

  // "candidate-documents" is a private bucket — every link needs a signed URL.
  const docUrls = await getCandidateDocumentSignedUrls((documents || []).map(d => d.file_path));

  const c = caseData.candidates as any;
  const candidateName = `${c?.first_name} ${c?.last_name}`;
  const candidateInitials = `${c?.first_name?.[0] || ''}${c?.last_name?.[0] || ''}`.toUpperCase();
  const employerName = (caseData.employers as any)?.name;
  const countryName = (caseData.countries as any)?.name;
  const privateDetails = Array.isArray(c?.candidate_private_details) ? c.candidate_private_details[0] : c?.candidate_private_details;
  const passportNumber = privateDetails?.passport_number;

  const daysOpen = Math.max(0, Math.floor((Date.now() - new Date(caseData.opened_at).getTime()) / (1000 * 60 * 60 * 24)));

  const formatDate = (d?: string | null, withTime = false) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    });
  };

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

          <div className="page-head" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                Case {caseData.public_code}
                <span className="tag" style={{
                  background: caseData.status === 'approved' ? '#dcf4e6' : caseData.status === 'rejected' ? '#ffe4e6' : '#fef1d8',
                  color: caseData.status === 'approved' ? '#008a3d' : caseData.status === 'rejected' ? '#e11d48' : '#b46d00',
                  border: 'none',
                  fontSize: '11px'
                }}>
                  • {caseData.status.replace(/_/g, ' ').toUpperCase()}
                </span>
              </h1>
              <p className="ph-sub">
                Candidate: {candidateName} ({c?.public_code}) · Employer: {employerName}
                {countryName && <> · Destination: {countryName}</>}
              </p>
            </div>
            <div style={{ textAlign: 'right', fontSize: '12.5px', color: 'var(--slate)' }}>
              <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{daysOpen} day{daysOpen === 1 ? '' : 's'} open</div>
              <div>Opened {formatDate(caseData.opened_at)}</div>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
                    {(() => {
                      const photo = documents?.find(d => d.type === 'photo');
                      const photoUrl = photo ? docUrls[photo.file_path] : null;
                      return photoUrl ? (
                        <div style={{ width: '52px', height: '52px', borderRadius: '12px', backgroundImage: `url(${photoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'var(--brand-soft)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '17px', flexShrink: 0 }}>
                          {candidateInitials}
                        </div>
                      );
                    })()}
                    <div>
                      <div style={{ fontSize: '15.5px', fontWeight: 600, color: 'var(--ink)' }}>{candidateName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{c?.public_code}</div>
                    </div>
                  </div>

                  <div className="resp-grid-2" style={{ marginBottom: 0 }}>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '4px' }}>Nationality</div>
                      <div style={{ fontSize: '14.5px', color: 'var(--ink)' }}>{c?.nationality || '--'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '4px' }}>Gender</div>
                      <div style={{ fontSize: '14.5px', color: 'var(--ink)', textTransform: 'capitalize' }}>{c?.gender || '--'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '4px' }}>Passport No.</div>
                      <div style={{ fontSize: '14.5px', color: 'var(--ink)' }}>{passportNumber || 'N/A'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '4px' }}>Destination</div>
                      <div style={{ fontSize: '14.5px', color: 'var(--ink)' }}>{countryName || '--'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Case Summary — read-only view of the fields set on the right;
                  otherwise a lawyer has to open the edit form just to see them. */}
              <div className="card">
                <div className="card-h">
                  <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Case Summary</h3>
                </div>
                <div className="card-b" style={{ padding: '4px 0' }}>
                  <div className="kv" style={{ padding: '0 22px' }}>
                    <div className="r">
                      <div className="k">Application reference</div>
                      <div className="v">{caseData.application_reference || '--'}</div>
                    </div>
                    <div className="r">
                      <div className="k">Embassy appointment</div>
                      <div className="v">{formatDate(caseData.embassy_appointment_at, true) || 'Not scheduled'}</div>
                    </div>
                    <div className="r">
                      <div className="k">Expected decision</div>
                      <div className="v">{formatDate(caseData.expected_decision_date) || 'Unknown'}</div>
                    </div>
                    {caseData.legal_notes && (
                      <div className="r">
                        <div className="k">Legal notes</div>
                        <div className="v" style={{ maxWidth: '260px', textAlign: 'right' }}>{caseData.legal_notes}</div>
                      </div>
                    )}
                    {caseData.status === 'rejected' && caseData.rejection_reason && (
                      <div className="r">
                        <div className="k" style={{ color: '#b91c1c' }}>Rejection reason</div>
                        <div className="v" style={{ maxWidth: '260px', textAlign: 'right', color: '#b91c1c' }}>{caseData.rejection_reason}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="card">
                <div className="card-h">
                  <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Documents</h3>
                  <span className="chip" style={{ background: 'var(--paper)', color: 'var(--slate)', border: 'none', fontSize: '11px', fontWeight: 700 }}>{documents?.length || 0}</span>
                </div>
                <div className="card-b" style={{ padding: '0 22px' }}>
                  {(documents || []).map(doc => {
                    const style = getDocIcon(doc.mime_type);
                    return (
                      <div key={doc.id} className="doc">
                        <div className="dic" style={{ color: style.color, background: style.bg, borderColor: style.bg }}>{getDocFormat(doc.mime_type, doc.file_path)}</div>
                        <div>
                          <div className="dnm" style={{ textTransform: 'capitalize' }}>{doc.type.replace(/_/g, ' ')}</div>
                          <div className="dmeta">
                            {doc.file_name}{doc.size_bytes ? ` · ${(doc.size_bytes / 1024 / 1024).toFixed(1)} MB` : ''} · {new Date(doc.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="dright">
                          <a href={docUrls[doc.file_path] || '#'} target="_blank" rel="noopener noreferrer">
                            <button className="ico-btn">↓</button>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                  {(!documents || documents.length === 0) && (
                    <div style={{ padding: '20px 0', fontSize: '13px', color: 'var(--muted)' }}>No documents uploaded yet.</div>
                  )}

                  <div style={{ margin: '0 -22px', padding: '20px 22px', borderTop: '1px solid var(--line)', background: 'var(--paper)' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '14px' }}>Upload new document</h4>
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
                    
                    {(events || []).map((e, i) => {
                      const dotColor = e.status === 'approved' ? 'var(--green)' : e.status === 'rejected' ? '#e11d48' : 'var(--brand)';
                      return (
                        <div key={e.id} style={{ position: 'relative', marginBottom: i === (events?.length || 0) - 1 ? 0 : '24px' }}>
                          <div style={{ position: 'absolute', left: '-19px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: dotColor, border: '2px solid #fff' }}></div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                            Status changed to: <span style={{ textTransform: 'capitalize' }}>{e.status.replace(/_/g, ' ')}</span>
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
                      );
                    })}
                    {(!events || events.length === 0) && (
                      <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '24px' }}>No status changes yet.</div>
                    )}
                    
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
