'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateJobOffer } from '@/app/actions/employer-actions';

interface Position {
  id: string;
  name: string;
}

interface Country {
  id: string;
  name: string;
}

interface JobOffer {
  id: string;
  position_id: string;
  country_id: string;
  staff_needed: number;
  salary_amount: number | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
}

export default function ClientEditOfferForm({
  offer,
  positions,
  countries,
}: {
  offer: JobOffer;
  positions: Position[];
  countries: Country[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [positionId, setPositionId] = useState(offer.position_id || '');
  const [countryId, setCountryId] = useState(offer.country_id || '');
  const [staffNeeded, setStaffNeeded] = useState(offer.staff_needed?.toString() || '1');
  const [salaryAmount, setSalaryAmount] = useState(offer.salary_amount?.toString() || '');
  const [startDate, setStartDate] = useState(offer.start_date || '');
  const [endDate, setEndDate] = useState(offer.end_date || '');
  const [status, setStatus] = useState(offer.status || 'open');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await updateJobOffer(offer.id, formData);
      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
      } else {
        router.push(`/dashboard/employer/offers/${offer.id}`);
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred while saving.');
      setIsSubmitting(false);
    }
  }

  const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '14px', color: 'var(--ink)' };
  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600 as const, color: 'var(--ink)', marginBottom: '8px' };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: '32px 40px', background: 'var(--card)', borderRadius: '16px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
      {error && (
        <div style={{ padding: '14px 16px', background: '#fee2e2', color: '#991b1b', borderRadius: '10px', marginBottom: '24px', fontSize: '14px', lineHeight: '1.5', border: '1px solid #fecaca' }}>
          <strong style={{ display: 'block', marginBottom: '4px' }}>⚠ Error</strong>
          {error}
        </div>
      )}

      <div className="resp-grid-2" style={{ gap: '24px' }}>
        <div>
          <label style={labelStyle}>Position</label>
          <select name="positionId" required value={positionId} onChange={(e) => setPositionId(e.target.value)} style={inputStyle}>
            <option value="" disabled>Select a position...</option>
            {positions.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Destination Country</label>
          <select name="countryId" required value={countryId} onChange={(e) => setCountryId(e.target.value)} style={inputStyle}>
            <option value="" disabled>Select destination country...</option>
            {countries.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Number of staff needed</label>
          <input name="staffNeeded" type="number" required min="1" value={staffNeeded} onChange={(e) => setStaffNeeded(e.target.value)} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Net Salary per month</label>
          <input name="salaryAmount" type="number" min="0" step="0.01" placeholder="0.00" value={salaryAmount} onChange={(e) => setSalaryAmount(e.target.value)} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Start Date Of Employment</label>
          <input name="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>End Date Of Employment</label>
          <input name="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Status</label>
          <select name="status" value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
            <option value="open">Open</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
        <button type="button" onClick={() => router.back()} className="btn" style={{ background: '#fff', border: '1px solid var(--line-2)', color: 'var(--ink)', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn btn-gold" style={{ border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
          {isSubmitting ? <><span className="btn-spinner" />Saving Changes...</> : 'Save Vacancy Changes'}
        </button>
      </div>
    </form>
  );
}
