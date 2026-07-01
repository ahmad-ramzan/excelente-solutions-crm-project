import AppSidebar from '../../../../components/AppSidebar';
import AppTopbar from '../../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

export default async function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const cndId = (await params).id;

  // Fetch Candidate
  const { data: cand } = await supabase
    .from('candidate_public_view')
    .select('*')
    .eq('public_code', cndId)
    .single();

  if (!cand) notFound();

  // Fetch Private Details
  const { data: priv } = await supabase
    .from('candidate_private_details')
    .select('*')
    .eq('candidate_id', cand.id)
    .single();

  // Fetch Documents
  const { data: docs } = await supabase
    .from('candidate_documents')
    .select('*')
    .eq('candidate_id', cand.id)
    .order('created_at', { ascending: false });

  // Fetch Visa Case to see assigned slot and lawyer docs
  const { data: visa } = await supabase
    .from('visa_cases')
    .select('id, job_offer_selections(job_offers(title, employers(name)))')
    .eq('candidate_id', cand.id)
    .single();

  const initials = `${cand.first_name?.[0] || ''}${cand.last_name?.[0] || ''}`.toUpperCase();
  const name = `${cand.first_name} ${cand.last_name}`;

  const getStatusProps = (s: string) => {
    switch (s) {
      case 'available': return { bg: '#dcfce7', color: '#166534', label: 'AVAILABLE' };
      case 'selected': return { bg: '#fef08a', color: '#854d0e', label: 'SELECTED' };
      case 'visa_processing': return { bg: '#e0e7ff', color: '#3730a3', label: 'VISA PROCESSING' };
      case 'approved': return { bg: '#dbeafe', color: '#1e40af', label: 'APPROVED' };
      default: return { bg: 'var(--line-2)', color: 'var(--slate)', label: s.toUpperCase() };
    }
  };

  const currentStatusProps = getStatusProps(cand.status);

  const getDocIcon = (type: string) => {
    if (type.includes('image')) return { color: 'var(--brand)', bg: 'var(--brand-soft)', border: 'var(--brand-soft)' };
    return { color: 'var(--red)', bg: '#fee2e2', border: '#fecaca' };
  };

  const getDocFormat = (mime: string, path: string) => {
    if (mime?.includes('pdf')) return 'PDF';
    if (mime?.includes('image')) return 'IMG';
    const ext = path.split('.').pop()?.toUpperCase();
    return ext || 'FILE';
  };

  return (
    <>
      <AppSidebar role="admin" />
      <div className="main">
        <AppTopbar section={name} />
        <div className="wrap">
          <div className="prof">
            
            {/* LEFT PROFILE CARD */}
            <div>
              <div className="prof-card">
                {docs?.find(d => d.type === 'photo') ? (
                  <div className="pp" style={{ 
                    backgroundImage: `url(${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/candidate-documents/${docs.find(d => d.type === 'photo')?.file_path})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: 'none'
                  }} />
                ) : (
                  <div className="pp" style={{ color: '#ffffff' }}>{initials}</div>
                )}
                
                <div className="pi">
                  <h2>{name}</h2>
                  <div className="id">{cndId}</div>
                  <div style={{ marginTop: '14px' }}>
                    <span className="tag" style={{ background: currentStatusProps.bg, color: currentStatusProps.color, border: 'none', lineHeight: '1.2' }}>• {currentStatusProps.label}</span>
                  </div>
                </div>
                {docs?.find(d => d.type === 'cv') && (
                  <div className="pact">
                    <a href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/candidate-documents/${docs.find(d => d.type === 'cv')?.file_path}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', width: '100%' }}>
                      <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>View CV</button>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="split-col">
              
              {/* Application Status */}
              <div className="card">
                <div className="card-h">
                  <h3>Application status</h3>
                </div>
                <div className="card-b" style={{ padding: '32px 22px' }}>
                  <div className="pipe">
                    {[
                      { label: 'Available', key: 'available', icon: '✓' },
                      { label: 'Selected', key: 'selected', icon: '✓' },
                      { label: 'Visa Processing', key: 'visa_processing', icon: '🏢' },
                      { label: 'Approved', key: 'approved', icon: '✓' },
                    ].map((ps, idx) => {
                      const stages = ['available', 'selected', 'visa_processing', 'approved'];
                      const currentIdx = stages.indexOf(cand.status);
                      const isDone = currentIdx > idx;
                      const isCur = currentIdx === idx;
                      const isLast = idx === 3;
                      
                      return (
                        <div key={ps.label} className={`node ${isDone ? 'done' : isCur ? 'cur' : ''}`}>
                          <div className="stamp" style={{ 
                            color: isDone ? 'var(--green)' : isCur ? 'var(--brand)' : 'var(--muted)', 
                            borderColor: isDone ? 'var(--green)' : isCur ? 'var(--brand)' : 'var(--line)',
                            background: isDone ? 'transparent' : isCur ? 'var(--brand-soft)' : 'var(--card)'
                          }}>
                            {ps.icon}
                          </div>
                          <div className="lab">{ps.label}</div>
                          {!isLast && <div className="bar" style={{ background: isDone ? 'var(--green)' : 'var(--line)' }} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Candidate information */}
              <div className="card">
                <div className="card-h">
                  <h3>Candidate information</h3>
                </div>
                <div className="card-b" style={{ padding: '4px 0' }}>
                  <div className="kv" style={{ padding: '0 22px' }}>
                    <div className="r">
                      <div className="k">Father's name</div>
                      <div className="v">{priv?.contact_name || '--'}</div>
                    </div>
                    <div className="r">
                      <div className="k">Date of birth</div>
                      <div className="v">{priv?.date_of_birth || '--'}</div>
                    </div>
                    <div className="r">
                      <div className="k">Gender</div>
                      <div className="v">{cand.gender || '--'}</div>
                    </div>
                    <div className="r">
                      <div className="k">Nationality</div>
                      <div className="v">{cand.nationality || '--'}</div>
                    </div>
                    <div className="r">
                      <div className="k">Destination</div>
                      <div className="v">{cand.country_name} <span className="chip" style={{ background: 'var(--ink)', color: '#fff', padding: '2px 6px', fontSize: '10px', marginLeft: '4px', border: 'none' }}>{cand.country_code}</span></div>
                    </div>
                    <div className="r">
                      <div className="k">City of visa application</div>
                      <div className="v">{cand.city || '--'}</div>
                    </div>
                    {visa && (
                      <div className="r">
                        <div className="k">Assigned slot</div>
                        <div className="v">{visa.job_offer_selections?.job_offers?.title || 'Slot'} - {visa.job_offer_selections?.job_offers?.employers?.name}</div>
                      </div>
                    )}
                    <div className="r">
                      <div className="k">Positions applied</div>
                      <div className="v">
                        {cand.positions?.map((p: string) => (
                          <span key={p} className="chip" style={{ marginRight: '4px' }}>{p}</span>
                        )) || '--'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Passport */}
              <div className="card">
                <div className="card-h">
                  <h3>Passport</h3>
                </div>
                <div className="card-b" style={{ padding: '4px 0' }}>
                  <div className="kv" style={{ padding: '0 22px' }}>
                    <div className="r">
                      <div className="k">Passport no.</div>
                      <div className="v">{priv?.passport_number || '--'}</div>
                    </div>
                    <div className="r">
                      <div className="k">Expiry</div>
                      <div className="v">{priv?.passport_expiry || '--'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact information */}
              <div className="card">
                <div className="card-h">
                  <h3>Contact information</h3>
                </div>
                <div className="card-b" style={{ padding: '4px 0' }}>
                  <div className="kv" style={{ padding: '0 22px' }}>
                    <div className="r">
                      <div className="k">Phone</div>
                      <div className="v">{priv?.contact_phone || '--'}</div>
                    </div>
                    <div className="r">
                      <div className="k">Email</div>
                      <div className="v">{priv?.contact_email || '--'}</div>
                    </div>
                    <div className="r">
                      <div className="k">Address</div>
                      <div className="v">{priv?.emergency_contact || '--'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="card">
                <div className="card-h">
                  <h3>Documents</h3>
                </div>
                <div className="card-b" style={{ padding: '0 22px' }}>
                  {docs?.filter(d => d.type !== 'visa_application_slip' && d.type !== 'approved_visa').map(d => {
                    const style = getDocIcon(d.mime_type);
                    return (
                      <div key={d.id} className="doc">
                        <div className="dic" style={{ color: style.color, background: style.bg, borderColor: style.border }}>{getDocFormat(d.mime_type, d.file_path)}</div>
                        <div>
                          <div className="dnm" style={{ textTransform: 'capitalize' }}>{d.type.replace(/_/g, ' ')}</div>
                          <div className="dmeta">{d.file_name} · {(d.size_bytes / 1024 / 1024).toFixed(1)} MB</div>
                        </div>
                        <div className="dright">
                          <a href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/candidate-documents/${d.file_path}`} target="_blank" rel="noopener noreferrer">
                            <button className="ico-btn">↓</button>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                  {docs?.length === 0 && (
                    <div style={{ padding: '20px 0', fontSize: '13px', color: 'var(--muted)' }}>No documents uploaded.</div>
                  )}
                </div>
              </div>

              {/* Visa documents */}
              <div className="card">
                <div className="card-h">
                  <h3>Visa documents</h3>
                  <span className="chip" style={{ background: '#fff0db', color: '#b46d00', border: 'none', fontSize: '10px', fontWeight: 700 }}>↑ FROM LAWYER</span>
                </div>
                <div className="card-b" style={{ padding: '0 22px' }}>
                  {docs?.filter(d => d.type === 'visa_application_slip' || d.type === 'approved_visa').map(d => {
                    const style = getDocIcon(d.mime_type);
                    return (
                      <div key={d.id} className="doc">
                        <div className="dic" style={{ color: style.color, background: style.bg, borderColor: style.border }}>{getDocFormat(d.mime_type, d.file_path)}</div>
                        <div>
                          <div className="dnm" style={{ textTransform: 'capitalize' }}>{d.type.replace(/_/g, ' ')}</div>
                          <div className="dmeta">{d.file_name}</div>
                        </div>
                        <div className="dright">
                          <a href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/candidate-documents/${d.file_path}`} target="_blank" rel="noopener noreferrer">
                            <button className="ico-btn">↓</button>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                  {!docs?.some(d => d.type === 'visa_application_slip' || d.type === 'approved_visa') && (
                    <div style={{ padding: '20px 0', fontSize: '13px', color: 'var(--muted)' }}>No visa documents yet.</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
