'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createJobOffer } from '@/app/actions/employer-actions';

export default function ClientOfferForm({ 
  employerId, 
  employerName, 
  countryId, 
  countryName,
  positions
}: {
  employerId: string;
  employerName: string;
  countryId: string;
  countryName: string;
  positions: { id: string, name: string }[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);

    formData.append('employerId', employerId);
    formData.append('countryId', countryId);

    const result = await createJobOffer(formData);
    
    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      router.push('/dashboard/employer/offers');
    }
  }

  return (
    <form action={handleSubmit} className="card" style={{ padding: '32px 40px', background: 'var(--card)', borderRadius: '16px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
      {error && (
        <div style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
          {error}
        </div>
      )}
      
      {/* Section 1 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ width: '24px', height: '24px', background: 'var(--ink)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
          1
        </div>
        <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>Employer & requirement</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Employer</label>
          <input type="text" readOnly value={`${employerName} (${countryName})`} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#f8fafc', fontSize: '14px', color: 'var(--slate)', cursor: 'not-allowed' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Country</label>
          <input type="text" readOnly value={countryName} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#f8fafc', fontSize: '14px', color: 'var(--slate)', cursor: 'not-allowed' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Position</label>
          <select name="positionId" required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '14px', color: 'var(--ink)', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2212%22%20height%3D%228%22%20viewBox%3D%220%200%2012%208%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M1%201.5L6%206.5L11%201.5%22%20stroke%3D%22%23111827%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}>
            <option value="">Select a position...</option>
            {positions.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Staff needed</label>
          <input type="number" name="staffNeeded" required min="1" defaultValue="1" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '14px', color: 'var(--ink)' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Salary amount (Optional)</label>
          <input type="number" name="salaryAmount" min="0" step="0.01" placeholder="0.00" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '14px', color: 'var(--ink)' }} />
        </div>
      </div>

      <div style={{ height: '1px', background: 'var(--line)', margin: '32px 0' }}></div>

      {/* Section 2 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ width: '24px', height: '24px', background: 'var(--ink)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
          2
        </div>
        <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>Contract terms</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Start date</label>
          <div style={{ position: 'relative' }}>
            <input type="date" name="startDate" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '14px', color: 'var(--ink)' }} />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>End date</label>
          <div style={{ position: 'relative' }}>
            <input type="date" name="endDate" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '14px', color: 'var(--ink)' }} />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" name="contractSigned" defaultChecked style={{ width: '16px', height: '16px', accentColor: '#36b9ff' }} />
          <span style={{ fontSize: '13.5px', color: 'var(--slate)' }}>Contract signed with employer</span>
        </label>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button type="button" onClick={() => router.back()} className="btn" style={{ background: '#fff', border: '1px solid var(--line-2)', color: 'var(--ink)', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn" style={{ background: '#6366f1', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
          {isSubmitting ? 'Creating...' : 'Create Job Offer'}
        </button>
      </div>

    </form>
  );
}
