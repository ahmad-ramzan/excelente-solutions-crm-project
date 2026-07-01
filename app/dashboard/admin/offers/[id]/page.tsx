import AppSidebar from '../../../../components/AppSidebar';
import AppTopbar from '../../../../components/AppTopbar';
import Link from 'next/link';

export default function OfferDetailsPage({ params }: { params: { id: string } }) {
  // Using JO-118 mockup data
  const orderId = params.id || 'JO-118';
  const role = 'Driver';
  const headcount = 50;
  const filled = 21;
  const vacant = headcount - filled;
  const employer = 'ABC Construction';
  const country = 'Russia';
  const cCode = 'RU';

  return (
    <>
      <AppSidebar role="admin" />
      <div className="main">
        <AppTopbar section={orderId} />
        <div className="wrap">
          <div style={{ marginBottom: '24px' }}>
            <Link href="/dashboard/admin/offers">
              <button className="btn btn-ghost btn-sm" style={{ padding: '6px 12px', fontSize: '12px' }}>
                ← Back to Job Offers
              </button>
            </Link>
          </div>

          <div className="page-head" style={{ marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '36px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {role} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>×</span> {headcount}
              </h1>
              <p className="ph-sub" style={{ fontSize: '13.5px', marginTop: '8px' }}>
                Offer {orderId} · {employer} · destination {country} <span className="chip" style={{ background: 'var(--ink)', color: '#fff', padding: '2px 6px', fontSize: '10px', marginLeft: '4px', border: 'none' }}>{cCode}</span>
              </p>
            </div>
            <div className="ph-act">
              <button className="btn btn-ghost btn-sm">Edit offer</button>
            </div>
          </div>

          <div className="slotsum">
            <div className="sc">
              <div className="v">{headcount}</div>
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
                {Array.from({ length: filled }).map((_, i) => (
                  <div key={`filled-${i}`} className="slot filled">
                    <div className="sa">✓</div>
                    <div>
                      <div className="sl">DRIVER • SLOT {i + 1}</div>
                      <div className="sn">{i === 0 ? 'Bilal Ahmed' : i === 1 ? 'Usman Riaz' : 'Assigned candidate'}</div>
                      <div className="ss">Driver - Selected</div>
                    </div>
                  </div>
                ))}
                {Array.from({ length: vacant }).map((_, i) => (
                  <div key={`vacant-${i}`} className="slot vacant">
                    <div className="sa" style={{ borderStyle: 'dashed' }}>{filled + i + 1}</div>
                    <div>
                      <div className="sl">DRIVER • SLOT {filled + i + 1}</div>
                      <div className="sn">Vacant</div>
                    </div>
                  </div>
                ))}
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
                      <div className="k">Country</div>
                      <div className="v">{country} <span className="chip" style={{ background: 'var(--ink)', color: '#fff', padding: '2px 6px', fontSize: '10px', marginLeft: '4px', border: 'none' }}>{cCode}</span></div>
                    </div>
                    <div className="r">
                      <div className="k">Position</div>
                      <div className="v">{role}</div>
                    </div>
                    <div className="r">
                      <div className="k">Staff needed</div>
                      <div className="v">{headcount}</div>
                    </div>
                    <div className="r">
                      <div className="k">Staff selected</div>
                      <div className="v">{filled}</div>
                    </div>
                    <div className="r">
                      <div className="k">Start date</div>
                      <div className="v">01 Aug 2026</div>
                    </div>
                    <div className="r">
                      <div className="k">End date</div>
                      <div className="v">01 Feb 2027</div>
                    </div>
                    <div className="r">
                      <div className="k">Contract signed</div>
                      <div className="v"><span className="tag t-approve">• YES</span></div>
                    </div>
                    <div className="r">
                      <div className="k">Status</div>
                      <div className="v"><span className="tag t-approve">• OPEN</span></div>
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
                    When this order was created the system generated <strong>{headcount} {role.toLowerCase()} slots</strong>.
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
