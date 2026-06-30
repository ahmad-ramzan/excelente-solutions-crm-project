import AppSidebar from '../../components/AppSidebar';
import AppTopbar from '../../components/AppTopbar';
import StatusBadge from '../../components/StatusBadge';
import { candidates, orders } from '../../lib/mock-data';

export default function EmployerDashboard() {
  // Employer Petrov Construction sees only Russia candidates
  const myOrder = orders.find((o) => o.employer === 'Petrov Construction LLC')!;
  const visibleCandidates = candidates.filter((c) => c.country === 'Russia');
  const filled = Array.from({ length: myOrder.filled }, (_, i) => ({
    name: candidates[i]?.name || `Candidate ${i + 1}`,
    initials: candidates[i]?.initials || 'XX',
    trade: candidates[i]?.trade || myOrder.role,
  }));
  const vacancies = myOrder.headcount - myOrder.filled;

  return (
    <>
      <AppSidebar role="employer" />
      <div className="main">
        <AppTopbar section="Browse Candidates" />
        <div className="wrap">
          <div className="page-head">
            <div>
              <h1>Employer Dashboard</h1>
              <p className="ph-sub">
                Petrov Construction LLC · Russia market
              </p>
            </div>
            <div className="ph-act">
              <button className="btn btn-ghost btn-sm">My Orders</button>
              <button className="btn btn-gold btn-sm">Request Headcount</button>
            </div>
          </div>

          {/* Position slot summary */}
          <div className="banner">
            <div className="bi">📋</div>
            <div>
              <b>Active Order: {myOrder.id}</b> — {myOrder.role} · {myOrder.country} ·{' '}
              {myOrder.headcount} positions requested
            </div>
          </div>

          <div className="slotsum">
            <div className="sc fill">
              <div className="v">{myOrder.filled}</div>
              <div className="l">Positions filled</div>
            </div>
            <div className="sc vac">
              <div className="v">{vacancies}</div>
              <div className="l">Vacancies remaining</div>
            </div>
            <div className="sc">
              <div className="v">{myOrder.headcount}</div>
              <div className="l">Total requested</div>
            </div>
          </div>

          {/* Position slots visual */}
          <div className="card" style={{ marginBottom: 22 }}>
            <div className="card-h">
              <h3>Position Slots</h3>
            </div>
            <div className="card-pad">
              <div className="slotgrid">
                {Array.from({ length: myOrder.headcount }, (_, i) => {
                  const isFilled = i < myOrder.filled;
                  const person = candidates[i];
                  return (
                    <div key={i} className={`slot ${isFilled ? 'filled' : 'vacant'}`}>
                      <div className="sa">
                        {isFilled ? person?.initials || (i + 1) : i + 1}
                      </div>
                      <div>
                        <div className="sl">Slot {i + 1}</div>
                        <div className="sn">
                          {isFilled ? person?.name || 'Assigned' : 'Vacant'}
                        </div>
                        {isFilled && <div className="ss">Confirmed</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Browse candidates */}
          <div className="card-h" style={{ padding: '18px 0', marginBottom: 18 }}>
            <h3>Available Candidates — Russia</h3>
            <div className="filter-bar" style={{ margin: 0 }}>
              <select className="input" style={{ width: 'auto', padding: '7px 12px' }}>
                <option>All Trades</option>
                <option>Welder</option>
                <option>Crane Operator</option>
              </select>
            </div>
          </div>

          <div className="cgrid">
            {visibleCandidates.map((c) => (
              <div key={c.id} className="ccard">
                <div className="ph">
                  <span className="phinit">{c.initials}</span>
                  <div className="st">
                    <StatusBadge status={c.status} />
                  </div>
                </div>
                <div className="cb">
                  <h4>{c.name}</h4>
                  <div className="meta">{c.nationality} · {c.trade}</div>
                  <div className="pos">
                    {c.skills.map((s) => (
                      <span key={s} className="chip">
                        {s}
                      </span>
                    ))}
                  </div>
                  {c.status === 'available' ? (
                    <button className="btn btn-gold btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                      Select Candidate
                    </button>
                  ) : (
                    <div className="locked">🔒 Already selected</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
