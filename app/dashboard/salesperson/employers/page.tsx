import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function SalespersonEmployersPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch Employers for this Salesperson
  const { data: dbEmployers } = await supabase
    .from('employers')
    .select('id, public_code, name, country_id, countries(name, code)')
    .eq('assigned_salesperson_id', user.id)
    .order('created_at', { ascending: false });

  const employersList = dbEmployers || [];
  const employerIds = employersList.map(e => e.id);

  // Fetch Job Offers for these employers
  let offersList: any[] = [];
  if (employerIds.length > 0) {
    const { data: dbOrders } = await supabase
      .from('job_offers')
      .select('id, employer_id, staff_needed, status')
      .in('employer_id', employerIds);
    
    offersList = dbOrders || [];
  }

  // Get filled counts for offers (using job_offer_slots)
  let slotsData: any[] = [];
  if (offersList.length > 0) {
    const offerIds = offersList.map(o => o.id);
    const { data: sData } = await supabase
      .from('job_offer_slots')
      .select('job_offer_id, status')
      .in('job_offer_id', offerIds);
    slotsData = sData || [];
  }

  const employers = employersList.map(e => {
    const eOffers = offersList.filter(o => o.employer_id === e.id);
    const eStaffNeeded = eOffers.reduce((acc, curr) => acc + (curr.staff_needed || 0), 0);
    const eOfferIds = eOffers.map(o => o.id);
    const eSlots = slotsData.filter(s => eOfferIds.includes(s.job_offer_id));
    const eFilled = eSlots.filter(s => ['reserved', 'filled'].includes(s.status)).length;

    return {
      id: e.id,
      public_code: e.public_code,
      initials: e.name.substring(0, 2).toUpperCase(),
      name: e.name,
      country: e.countries?.name || 'Unassigned',
      countryCode: e.countries?.code || 'XX',
      orders: eOffers.length,
      placements: eFilled,
      totalNeeded: eStaffNeeded
    };
  });

  return (
    <>
      <AppSidebar role="salesperson" />
      <div className="main">
        <AppTopbar section="Employers" />
        <div className="wrap">
          <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1>Employers</h1>
              <p className="ph-sub">Companies you manage recruitment for.</p>
            </div>
            {/* 
            <button className="btn" style={{ background: 'linear-gradient(135deg, #7b61ff, #36b9ff)', color: '#fff', fontSize: '13px', border: 'none', padding: '10px 20px', borderRadius: '8px' }}>
              + Add employer
            </button>
            */}
          </div>

          <div className="card" style={{ border: 'none', background: 'transparent', marginTop: '24px' }}>
            <div className="card-b" style={{ padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>EMPLOYER</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>COUNTRY</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)', textAlign: 'center' }}>JOB OFFERS</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)', textAlign: 'center' }}>STAFF NEEDED</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)', textAlign: 'center' }}>SELECTED</th>
                    <th style={{ padding: '0 22px 12px', borderBottom: '1px solid var(--line-2)' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {employers.map((e) => {
                    return (
                      <tr key={e.id} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '13px' }}>
                        <td style={{ padding: '16px 22px', borderTopLeftRadius: '13px', borderBottomLeftRadius: '13px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderLeft: '1px solid var(--line)' }}>
                          <div className="cell-name">
                            <div className="av-sm" style={{ background: 'var(--brand-soft)', color: 'var(--brand)', width: '38px', height: '38px', borderRadius: '10px', fontSize: '13px' }}>
                              {e.initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{e.name}</div>
                              <div style={{ color: 'var(--muted)', fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>
                                {e.public_code}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                          <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '13px' }}>{e.country}</span> 
                          <span className="chip" style={{ background: 'var(--ink)', color: '#fff', padding: '2px 5px', fontSize: '10px', border: 'none', marginLeft: '6px' }}>{e.countryCode.substring(0,3).toUpperCase()}</span>
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', textAlign: 'center', color: 'var(--slate)' }}>
                          {e.orders}
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', textAlign: 'center', color: 'var(--slate)' }}>
                          {e.totalNeeded}
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', textAlign: 'center' }}>
                           <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{e.placements}</span>
                        </td>
                        <td style={{ padding: '16px 22px', textAlign: 'right', borderTopRightRadius: '13px', borderBottomRightRadius: '13px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)' }}>
                          <button className="ico-btn" style={{ fontSize: '14px', border: '1px solid var(--line-2)', borderRadius: '6px', width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', background: 'transparent' }}>
                            →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {employers.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--slate)' }}>
                        No employers assigned yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
