'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { upsertTravelDetails } from '@/app/actions/travel-actions';

export default function TravelCoordinationCard({
  visaCaseId,
  travel,
}: {
  visaCaseId: string;
  travel: {
    ticket_booked: boolean;
    travel_date: string | null;
    arrival_date: string | null;
    employer_joining_date: string | null;
    notes: string | null;
  } | null;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append('visaCaseId', visaCaseId);

    const result = await upsertTravelDetails(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      router.refresh();
    }
    setIsSubmitting(false);
  }

  return (
    <div className="card">
      <div className="card-h">
        <h3>Travel coordination</h3>
      </div>
      <div className="card-b" style={{ padding: '22px' }}>
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ padding: '10px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--ink)', marginBottom: '16px', fontWeight: 600 }}>
            <input type="checkbox" name="ticketBooked" defaultChecked={travel?.ticket_booked || false} />
            Ticket booked
          </label>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--slate)', marginBottom: '6px' }}>Travel date</label>
            <input type="date" name="travelDate" defaultValue={travel?.travel_date || ''} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--line-2)', fontSize: '13.5px', background: 'var(--paper)' }} />
          </div>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--slate)', marginBottom: '6px' }}>Arrival date</label>
            <input type="date" name="arrivalDate" defaultValue={travel?.arrival_date || ''} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--line-2)', fontSize: '13.5px', background: 'var(--paper)' }} />
          </div>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--slate)', marginBottom: '6px' }}>Employer joining date</label>
            <input type="date" name="employerJoiningDate" defaultValue={travel?.employer_joining_date || ''} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--line-2)', fontSize: '13.5px', background: 'var(--paper)' }} />
          </div>

          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--slate)', marginBottom: '6px' }}>Notes</label>
            <textarea name="notes" defaultValue={travel?.notes || ''} placeholder="Handover notes, transit details, etc." style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--line-2)', fontSize: '13.5px', background: 'var(--paper)', minHeight: '60px', resize: 'vertical' }} />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-gold"
            style={{ width: '100%', justifyContent: 'center', opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? <><span className="btn-spinner" />Saving…</> : 'Save travel details'}
          </button>
        </form>
      </div>
    </div>
  );
}
