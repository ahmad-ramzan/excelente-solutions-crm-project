import AppSidebar from '../../../../components/AppSidebar';
import AppTopbar from '../../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import { getCandidateDocumentSignedUrls } from '@/app/lib/queries';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function EmployerCandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const cndId = (await params).id;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 1. Find the employer record for this user
  const { data: employerUser } = await supabase
    .from('employer_users')
    .select('employer_id')
    .eq('profile_id', user.id)
    .single();

  if (!employerUser) return null;

  const { data: employer } = await supabase
    .from('employers')
    .select('id, country_id, countries(name)')
    .eq('id', employerUser.employer_id)
    .single();

  if (!employer) return null;
  const employerCountry: any = employer.countries;
  const employerCountryName = Array.isArray(employerCountry) ? employerCountry[0]?.name : employerCountry?.name;

  // 2. Fetch the candidate (public info only — no passport/contact fields exist on this view)
  const { data: cand } = await supabase
    .from('candidate_public_view')
    .select('*')
    .eq('public_code', cndId)
    .single();

  if (!cand) notFound();

  // A candidate can have several destination countries (candidate_countries is
  // many-to-many) — candidate_public_view has no single country_name column.
  const { data: candidateCountries } = await supabase
    .from('candidate_countries')
    .select('countries(name, code)')
    .eq('candidate_id', cand.id)
    .order('created_at', { ascending: true });

  const countryNames = (candidateCountries || [])
    .map((row: any) => (Array.isArray(row.countries) ? row.countries[0] : row.countries)?.name)
    .filter(Boolean);
  const countryCodes = (candidateCountries || [])
    .map((row: any) => (Array.isArray(row.countries) ? row.countries[0] : row.countries)?.code)
    .filter(Boolean);
  const destinationLabel = cand.open_to_all_countries ? 'Any Country' : (countryNames.join(', ') || 'Unassigned');
  const destinationCode = cand.open_to_all_countries ? 'ANY' : (countryCodes.length === 1 ? countryCodes[0] : (countryNames.length ? `${countryNames.length} selected` : 'N/A'));

  // 3. Authorize: candidate must be available in this employer's country, OR already selected by this employer
  const isAvailableInCountry = cand.status === 'available'
    && (cand.open_to_all_countries || countryNames.includes(employerCountryName));

  const { data: existingSelection } = await supabase
    .from('job_offer_selections')
    .select('id, status')
    .eq('candidate_id', cand.id)
    .eq('employer_id', employer.id)
    .maybeSingle();

  if (!isAvailableInCountry && !existingSelection) notFound();

  // 4. Passport number/expiry only — contact fields (phone/email/address) stay admin-only
  const { data: priv } = await supabase
    .from('candidate_private_details')
    .select('passport_number, passport_expiry')
    .eq('candidate_id', cand.id)
    .maybeSingle();

  // 5. All documents
  const { data: docs } = await supabase
    .from('candidate_documents')
    .select('*')
    .eq('candidate_id', cand.id)
    .order('created_at', { ascending: false });

  // "candidate-documents" is a private bucket — every link needs a signed URL.
  const docUrls = await getCandidateDocumentSignedUrls((docs || []).map(d => d.file_path));

  const initials = `${cand.first_name?.[0] || ''}${cand.last_name?.[0] || ''}`.toUpperCase();
  const name = `${cand.first_name} ${cand.last_name}`;
  const photo = docs?.find(d => d.type === 'photo');
  const cv = docs?.find(d => d.type === 'cv');

  const getDocIcon = (type: string) => {
    if (type?.includes('image')) return { color: 'var(--brand)', bg: 'var(--brand-soft)', border: 'var(--brand-soft)' };
    return { color: 'var(--red)', bg: '#fee2e2', border: '#fecaca' };
  };

  const getDocFormat = (mime: string, path: string) => {
    if (mime?.includes('pdf')) return 'PDF';
    if (mime?.includes('image')) return 'IMG';
    const ext = path.split('.').pop()?.toUpperCase();
    return ext || 'FILE';
  };

  const getStatusProps = (s: string) => {
    switch (s) {
      case 'available': return { bg: '#dcfce7', color: '#166534', label: 'AVAILABLE' };
      case 'selected': return { bg: '#fef08a', color: '#854d0e', label: 'SELECTED' };
      case 'visa_processing': return { bg: '#e0e7ff', color: '#3730a3', label: 'VISA PROCESSING' };
      case 'approved': return { bg: '#dbeafe', color: '#1e40af', label: 'APPROVED' };
      default: return { bg: 'var(--line-2)', color: 'var(--slate)', label: s.toUpperCase() };
    }
  };
  const statusProps = getStatusProps(cand.status);

  return (
    <>
      <AppSidebar role="employer" />
      <div className="main">
        <AppTopbar section={name} />
        <div className="wrap">
          <div className="prof">

            {/* LEFT PROFILE CARD */}
            <div>
              <div className="prof-card">
                {photo && docUrls[photo.file_path] ? (
                  <div className="pp" style={{
                    backgroundImage: `url(${docUrls[photo.file_path]})`,
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
                    <span className="tag" style={{ background: statusProps.bg, color: statusProps.color, border: 'none', lineHeight: '1.2' }}>• {statusProps.label}</span>
                  </div>
                </div>
                {cv && docUrls[cv.file_path] && (
                  <div className="pact">
                    <a href={docUrls[cv.file_path]} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', width: '100%' }}>
                      <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>View CV</button>
                    </a>
                  </div>
                )}
                {cand.status === 'available' && !existingSelection && (
                  <div className="pact">
                    <Link href={`/dashboard/employer/offers?select=${cndId}`} style={{ textDecoration: 'none', width: '100%' }}>
                      <button className="btn" style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #7b61ff, #36b9ff)', border: 'none', color: '#fff' }}>Select</button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="split-col">

              {/* Privacy notice */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px',
                background: '#f5f3ff', border: '1px solid #e1d4fc', borderRadius: '10px',
                color: 'var(--slate)', fontSize: '13px', lineHeight: 1.5,
              }}>
                Contact details (phone, email, address) are visible to administrators only.
              </div>

              {/* Candidate information */}
              <div className="card">
                <div className="card-h">
                  <h3>Candidate information</h3>
                </div>
                <div className="card-b" style={{ padding: '4px 0' }}>
                  <div className="kv" style={{ padding: '0 22px' }}>
                    <div className="r">
                      <div className="k">Gender</div>
                      <div className="v">{cand.gender || '--'}</div>
                    </div>
                    <div className="r">
                      <div className="k">Destination</div>
                      <div className="v">{destinationLabel} <span className="chip" style={{ background: 'var(--ink)', color: '#fff', padding: '2px 6px', fontSize: '10px', marginLeft: '4px', border: 'none' }}>{destinationCode}</span></div>
                    </div>
                    <div className="r">
                      <div className="k">City of visa application</div>
                      <div className="v">{cand.city || '--'}</div>
                    </div>
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

              {/* Documents */}
              <div className="card">
                <div className="card-h">
                  <h3>Documents</h3>
                </div>
                <div className="card-b" style={{ padding: '0 22px' }}>
                  {docs?.map(d => {
                    const style = getDocIcon(d.mime_type);
                    return (
                      <div key={d.id} className="doc">
                        <div className="dic" style={{ color: style.color, background: style.bg, borderColor: style.border }}>{getDocFormat(d.mime_type, d.file_path)}</div>
                        <div>
                          <div className="dnm" style={{ textTransform: 'capitalize' }}>{d.type.replace(/_/g, ' ')}</div>
                          <div className="dmeta">{d.file_name}{d.size_bytes ? ` · ${(d.size_bytes / 1024 / 1024).toFixed(1)} MB` : ''}</div>
                        </div>
                        <div className="dright">
                          <a href={docUrls[d.file_path] || '#'} target="_blank" rel="noopener noreferrer">
                            <button className="ico-btn">↓</button>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                  {(!docs || docs.length === 0) && (
                    <div style={{ padding: '20px 0', fontSize: '13px', color: 'var(--muted)' }}>No documents uploaded.</div>
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
