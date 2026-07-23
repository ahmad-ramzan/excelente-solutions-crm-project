import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import SelectCandidateButton from './SelectCandidateButton';

export default async function EmployerJobOffersPage({ searchParams }: { searchParams: Promise<{ select?: string, filter?: string }> }) {
  const supabase = await createClient();
  const params = await searchParams;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 1. Find the employer record for this user
  const { data: employerUser } = await supabase
    .from('employer_users')
    .select('employer_id')
    .eq('profile_id', user.id)
    .single();

  if (!employerUser) return null;

  // 2. Fetch employer details
  const { data: employer } = await supabase
    .from('employers')
    .select('id, name')
    .eq('id', employerUser.employer_id)
    .single();

  if (!employer) return null;

  // 3. Fetch Job Offers for this employer
  const { data: offersData } = await supabase
    .from('job_offers')
    .select('*, countries(name, code), positions(name)')
    .eq('employer_id', employer.id)
    .order('created_at', { ascending: false });

  const offers = offersData || [];
  const offerIds = offers.map(o => o.id);

  // 4. Fetch all slots for these offers
  let slots: any[] = [];
  if (offerIds.length > 0) {
    const { data: slotsData } = await supabase
      .from('job_offer_slots')
      .select('*, candidate:candidates(id, first_name, last_name, public_code), job_offer:job_offers!inner(id, positions(name))')
      .in('job_offer_id', offerIds)
      .order('created_at', { ascending: true });
    
    slots = slotsData || [];
  }

  // 5. Partition slots
  const occupiedSlots = slots.filter(s => s.candidate_id != null);
  const vacantSlots = slots.filter(s => s.candidate_id == null);

  // Apply filters if any
  let displayOccupied = occupiedSlots;
  let displayVacant = vacantSlots;
  
  if (params.filter === 'selected') {
    displayVacant = [];
  } else if (params.filter === 'vacant') {
    displayOccupied = [];
  }

  // If arriving from "Select" on a candidate card, look them up and find offers with a vacant slot
  let selectingCandidate: { id: string; name: string; positions: string[] } | null = null;
  let eligibleOffers: typeof offers = [];

  if (params.select) {
    const { data: candidateRow } = await supabase
      .from('candidate_public_view')
      .select('id, first_name, last_name, positions, open_to_all_countries, country_ids')
      .eq('public_code', params.select)
      .single();

    if (candidateRow) {
      selectingCandidate = {
        id: candidateRow.id,
        name: `${candidateRow.first_name} ${candidateRow.last_name}`,
        positions: candidateRow.positions || [],
      };
      
      // Calculate filled counts for the selector dropdown
      const filledCounts: Record<string, number> = {};
      occupiedSlots.forEach(s => {
        if (!filledCounts[s.job_offer_id]) filledCounts[s.job_offer_id] = 0;
        filledCounts[s.job_offer_id]++;
      });

      eligibleOffers = offers.filter(
        (o) => {
          const hasVacant = o.status === 'open' && (filledCounts[o.id] || 0) < o.staff_needed;
          if (!hasVacant) return false;
          
          if (candidateRow.open_to_all_countries) return true;
          const candidateCountries = candidateRow.country_ids || [];
          return candidateCountries.includes(o.country_id);
        }
      );
    }
  }

  return (
    <>
      <AppSidebar role="employer" />
      <div className="main">
        <AppTopbar section="Vacancy Overview" />
        <div className="wrap">
          <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1>Vacancy Overview</h1>
              <p className="ph-sub">Manage your occupied and vacant position slots.</p>
            </div>
            <Link href="/dashboard/employer/offers/new">
              <button className="btn btn-gold" style={{ fontSize: '13px', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                + ADD VACANCY
              </button>
            </Link>
          </div>

          {selectingCandidate && (
            <div className="card" style={{ marginTop: '24px', padding: '20px 24px', background: '#f5f3ff', border: '1px solid #e1d4fc' }}>
              <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                Selecting {selectingCandidate.name}
              </div>
              <div style={{ color: 'var(--slate)', fontSize: '13px', marginBottom: '16px' }}>
                Choose which job offer to place this candidate into.
              </div>

              {eligibleOffers.length === 0 ? (
                <div style={{ color: 'var(--slate)', fontSize: '13.5px' }}>
                  No open job offers with a vacant slot in the candidate's requested countries right now.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {eligibleOffers.map((o) => (
                    <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#fff', borderRadius: '10px', border: '1px solid var(--line)' }}>
                      <div style={{ fontSize: '13.5px', color: 'var(--ink)' }}>
                        <b>{o.positions?.name || 'Various'}</b> · {o.countries?.name || 'Unknown'}
                      </div>
                      <SelectCandidateButton jobOfferId={o.id} candidateId={selectingCandidate!.id} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* YOUR VACANCIES SECTION — the job offers themselves, so they can be viewed/edited */}
          {offers.length > 0 && (
            <div style={{ marginTop: '32px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--brand)' }}></span>
                Your Vacancies
              </h2>

              <div className="resp-grid-cards">
                {offers.map((o: any) => {
                  const filled = slots.filter(s => s.job_offer_id === o.id && s.candidate_id != null).length;
                  return (
                    <div key={o.id} className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '180px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '15px' }}>
                          {o.positions?.name || 'Unknown Position'}
                        </div>
                        <div style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>
                          {o.countries?.name || 'Unassigned'} · {filled}/{o.staff_needed || 0} filled · {String(o.status).toUpperCase()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <Link href={`/dashboard/employer/offers/${o.id}`}>
                          <button className="btn btn-outline" style={{ padding: '6px 16px', fontSize: '12px' }}>View</button>
                        </Link>
                        <Link href={`/dashboard/employer/offers/${o.id}/edit`}>
                          <button className="btn" style={{ padding: '6px 16px', fontSize: '12px', background: 'var(--brand)', color: '#fff', border: 'none' }}>
                            Edit
                          </button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* OCCUPIED POSITIONS SECTION */}
          {displayOccupied.length > 0 && (
            <div style={{ marginTop: '32px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--green)' }}></span>
                Occupied Positions
              </h2>
              <div className="resp-grid-cards">
                {displayOccupied.map(slot => {
                  const candidate = slot.candidate;
                  const initials = `${candidate?.first_name?.[0] || ''}${candidate?.last_name?.[0] || ''}`.toUpperCase();
                  const positionName = slot.job_offer?.positions?.name || 'Unknown Position';

                  return (
                    <div key={slot.id} className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'linear-gradient(135deg, #7b61ff, #36b9ff)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700, flexShrink: 0 }}>
                        {initials}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '15px' }}>{candidate?.first_name} {candidate?.last_name}</div>
                        <div style={{ color: 'var(--slate)', fontSize: '13px', marginTop: '4px' }}>{positionName} · Slot {slot.slot_no}</div>
                      </div>
                      <Link href={`/dashboard/employer/candidates/${candidate?.public_code}`}>
                        <button className="btn btn-outline" style={{ padding: '6px 16px', fontSize: '12px' }}>View Details</button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VACANT POSITIONS SECTION */}
          {displayVacant.length > 0 && (
            <div style={{ marginTop: '48px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--slate)' }}></span>
                  Vacant Positions
                </h2>
                <Link href="/dashboard/employer/candidates">
                  <button className="btn btn-outline btn-sm">
                    SELECT CANDIDATES
                  </button>
                </Link>
              </div>
              
              <div className="resp-grid-cards">
                {displayVacant.map(slot => {
                  const positionName = slot.job_offer?.positions?.name || 'Unknown Position';

                  return (
                    <div key={slot.id} className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderStyle: 'dashed', borderColor: 'var(--line-2)', background: 'var(--paper)' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#f1f5f9', color: 'var(--slate)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: 'var(--slate)', fontSize: '15px' }}>{positionName}</div>
                        <div style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>Slot {slot.slot_no} · Vacant</div>
                      </div>
                      <Link href="/dashboard/employer/candidates">
                        <button className="btn" style={{ padding: '6px 16px', fontSize: '12px', background: 'var(--brand)', color: '#fff', border: 'none' }}>Fill Slot</button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {slots.length === 0 && (
             <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--line)', marginTop: '24px' }}>
               <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>No positions found</h3>
               <p style={{ color: 'var(--slate)', marginBottom: '24px' }}>You haven't generated any job positions yet.</p>
               <Link href="/dashboard/employer/offers/new">
                 <button className="btn btn-gold" style={{ padding: '10px 24px', fontWeight: 600 }}>ADD VACANCY</button>
               </Link>
             </div>
          )}

        </div>
      </div>
    </>
  );
}

