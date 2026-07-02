import AppSidebar from '../../../../components/AppSidebar';
import AppTopbar from '../../../../components/AppTopbar';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

export default async function SalespersonOfferDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: offer } = await supabase
    .from('job_offers')
    .select('*, countries(name, code), positions(name), employers(name)')
    .eq('id', id)
    .eq('assigned_salesperson_id', user.id)
    .single();

  if (!offer) notFound();

  const { data: slotsData } = await supabase
    .from('job_offer_slots')
    .select('*, candidates(first_name, last_name, public_code)')
    .eq('job_offer_id', offer.id)
    .order('slot_no');

  const slots = slotsData || [];
  const filled = slots.filter(s => s.status === 'filled' || s.status === 'reserved').length;
  const vacant = slots.length - filled;
  const role = offer.positions?.name || 'Various';
  const cCode = offer.countries?.code || 'XX';
  const countryName = offer.countries?.name || 'Unknown';
  const employerName = offer.employers?.name || 'Unknown';

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <>
      <AppSidebar role="salesperson" />
      <div className="main">
        <AppTopbar section={`JO-${offer.id.substring(0, 6).toUpperCase()}`} />
        <div className="wrap">
          <div style={{ marginBottom: '24px' }}>
            <Link href="/dashboard/salesperson/orders">
              <button className="btn btn-ghost btn-sm" style={{ padding: '6px 12px', fontSize: '12px' }}>
                ← Back to Job Offers
              </button>
            </Link>
          </div>

          <div className="page-head" style={{ marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '36px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {role} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>×</span> {offer.staff_needed}
              </h1>
              <p className="ph-sub" style={{ fontSize: '13.5px', marginTop: '8px' }}>
                Offer JO-{offer.id.substring(0, 6).toUpperCase()} · {employerName} · destination {countryName} <span className="chip" style={{ background: 'var(--ink)', color: '#fff', padding: '2px 6px', fontSize: '10px', marginLeft: '4px', border: 'none' }}>{cCode.substring(0, 3).toUpperCase()}</span>
              </p>
            </div>
          </div>

          <div className="slotsum">
            <div className="sc">
              <div className="v">{offer.staff_needed}</div>
              <div className="l">Total position slots</div>
            </div>
            <div className="sc fill">
              <div className="v">{filled}</div>
              <div className="l">Filled positions</div>
            </div>
            <div className="sc vac">
              <div className="v">{vacant}</div>
              <div className="l">Vacant — remaining to recruit</div>
            </div>
          </div>

          <div className="grid-2">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px' }}>Position slots</h3>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Auto-generated on order creation</span>
              </div>
              <div className="slotgrid">
                {slots.map(s => {
                  const isVacant = s.status === 'vacant';
                  const candidateName = s.candidates ? `${s.candidates.first_name} ${s.candidates.last_name}` : 'Unknown';

                  return isVacant ? (
                    <div key={s.id} className="slot vacant">
                      <div className="sa" style={{ borderStyle: 'dashed' }}>{s.slot_no}</div>
                      <div>
                        <div className="sl">{role.toUpperCase()} • SLOT {s.slot_no}</div>
                        <div className="sn">Vacant</div>
                      </div>
                    </div>
                  ) : (
                    <div key={s.id} className="slot filled">
                      <div className="sa">✓</div>
                      <div>
                        <div className="sl">{role.toUpperCase()} • SLOT {s.slot_no}</div>
                        <div className="sn">{candidateName}</div>
                        <div className="ss">{role} - {s.status}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="split-col">
              <div className="card">
                <div className="card-h">
                  <h3>Order details</h3>
                </div>
                <div className="card-b" style={{ padding: '4px 0' }}>
                  <div className="kv" style={{ padding: '0 22px' }}>
                    <div className="r">
                      <div className="k">Employer</div>
                      <div className="v">{employerName}</div>
                    </div>
                    <div className="r">
                      <div className="k">Country</div>
                      <div className="v">{countryName} <span className="chip" style={{ background: 'var(--ink)', color: '#fff', padding: '2px 6px', fontSize: '10px', marginLeft: '4px', border: 'none' }}>{cCode.substring(0, 3).toUpperCase()}</span></div>
                    </div>
                    <div className="r">
                      <div className="k">Position</div>
                      <div className="v">{role}</div>
                    </div>
                    <div className="r">
                      <div className="k">Staff needed</div>
                      <div className="v">{offer.staff_needed}</div>
                    </div>
                    <div className="r">
                      <div className="k">Staff selected</div>
                      <div className="v">{filled}</div>
                    </div>
                    <div className="r">
                      <div className="k">Start date</div>
                      <div className="v">{formatDate(offer.start_date)}</div>
                    </div>
                    <div className="r">
                      <div className="k">End date</div>
                      <div className="v">{formatDate(offer.end_date)}</div>
                    </div>
                    <div className="r">
                      <div className="k">Contract signed</div>
                      <div className="v"><span className="tag t-approve">• {offer.contract_signed ? 'YES' : 'NO'}</span></div>
                    </div>
                    <div className="r">
                      <div className="k">Status</div>
                      <div className="v">
                        <span className="tag" style={{
                          background: offer.status === 'open' ? '#eff6ff' : (offer.status === 'completed' ? '#dcf4e6' : '#f1f5f9'),
                          color: offer.status === 'open' ? '#3b82f6' : (offer.status === 'completed' ? '#008a3d' : '#475569'),
                          border: 'none'
                        }}>
                          • {offer.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-h">
                  <h3>How slots fill</h3>
                </div>
                <div className="card-b" style={{ padding: '18px 22px' }}>
                  <p style={{ fontSize: '12.5px', color: 'var(--slate)', lineHeight: 1.5 }}>
                    When this order was created the system generated <strong>{offer.staff_needed} {role.toLowerCase()} slots</strong>.
                    Each employer selection assigns the candidate to the next vacant slot automatically.
                    Slots stay empty until a candidate is assigned.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
