'use client';

import { useState } from 'react';
import { updateVisaStatus } from '@/app/actions/visa-actions';
import { useRouter } from 'next/navigation';

export default function ClientCaseStatusForm({ 
  visaCaseId, 
  currentStatus, 
  currentRemarks 
}: { 
  visaCaseId: string, 
  currentStatus: string, 
  currentRemarks: string 
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'documents_requested', label: 'Documents Requested' },
    { value: 'documents_received', label: 'Documents Received' },
    { value: 'submitted', label: 'Submitted to Consulate' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'closed', label: 'Closed' }
  ];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append('visaCaseId', visaCaseId);

    try {
      const result = await updateVisaStatus(formData);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{ padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--slate)', marginBottom: '8px' }}>Status</label>
        <select 
          name="status" 
          defaultValue={currentStatus}
          className="form-input" 
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line-2)', fontSize: '14px', background: 'var(--paper)' }}
        >
          {statuses.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="form-group" style={{ marginBottom: '24px' }}>
        <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--slate)', marginBottom: '8px' }}>Remarks (Optional)</label>
        <textarea 
          name="remarks"
          defaultValue={currentRemarks}
          className="form-input" 
          placeholder="Add internal notes or status details..."
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line-2)', fontSize: '14px', background: 'var(--paper)', minHeight: '80px', resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="btn" 
          style={{ background: 'var(--brand)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
        >
          {isSubmitting ? 'Saving...' : 'Update Status'}
        </button>
      </div>
    </form>
  );
}
