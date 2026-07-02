'use client';

import { useState } from 'react';
import { updateVisaStatus } from '@/app/actions/visa-actions';
import { useRouter } from 'next/navigation';

export default function ClientCaseStatusForm({
  visaCaseId,
  currentStatus,
  currentRemarks,
  currentApplicationReference,
  currentEmbassyAppointmentAt,
  currentExpectedDecisionDate,
  currentLegalNotes,
  currentRejectionReason,
}: {
  visaCaseId: string,
  currentStatus: string,
  currentRemarks: string,
  currentApplicationReference?: string | null,
  currentEmbassyAppointmentAt?: string | null,
  currentExpectedDecisionDate?: string | null,
  currentLegalNotes?: string | null,
  currentRejectionReason?: string | null,
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState(currentStatus);

  const statuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'documents_requested', label: 'Missing Documents' },
    { value: 'documents_received', label: 'Documents Received' },
    { value: 'documents_under_review', label: 'Documents Under Review' },
    { value: 'ready_for_submission', label: 'Ready for Submission' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'appointment_scheduled', label: 'Appointment Scheduled' },
    { value: 'biometrics_required', label: 'Biometrics Required' },
    { value: 'under_immigration_review', label: 'Under Immigration Review' },
    { value: 'additional_documents_requested', label: 'Additional Documents Requested' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'approved', label: 'Visa Approved' },
    { value: 'rejected', label: 'Visa Rejected' },
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
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="form-input"
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line-2)', fontSize: '14px', background: 'var(--paper)' }}
        >
          {statuses.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--slate)', marginBottom: '8px' }}>Remarks (Optional)</label>
        <textarea
          name="remarks"
          defaultValue={currentRemarks}
          className="form-input"
          placeholder="Add internal notes or status details..."
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line-2)', fontSize: '14px', background: 'var(--paper)', minHeight: '80px', resize: 'vertical' }}
        />
      </div>

      <div style={{ height: '1px', background: 'var(--line)', margin: '20px 0' }} />

      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--slate)', marginBottom: '8px' }}>Application reference no. (Optional)</label>
        <input
          name="applicationReference"
          defaultValue={currentApplicationReference || ''}
          className="form-input"
          placeholder="e.g. RU-VISA-2026-00123"
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line-2)', fontSize: '14px', background: 'var(--paper)' }}
        />
      </div>

      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--slate)', marginBottom: '8px' }}>Embassy / immigration appointment (Optional)</label>
        <input
          type="datetime-local"
          name="embassyAppointmentAt"
          defaultValue={currentEmbassyAppointmentAt ? currentEmbassyAppointmentAt.slice(0, 16) : ''}
          className="form-input"
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line-2)', fontSize: '14px', background: 'var(--paper)' }}
        />
      </div>

      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--slate)', marginBottom: '8px' }}>Expected decision date (Optional)</label>
        <input
          type="date"
          name="expectedDecisionDate"
          defaultValue={currentExpectedDecisionDate || ''}
          className="form-input"
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line-2)', fontSize: '14px', background: 'var(--paper)' }}
        />
      </div>

      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--slate)', marginBottom: '8px' }}>Legal notes (Optional)</label>
        <textarea
          name="legalNotes"
          defaultValue={currentLegalNotes || ''}
          className="form-input"
          placeholder="Internal legal notes about this case..."
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line-2)', fontSize: '14px', background: 'var(--paper)', minHeight: '60px', resize: 'vertical' }}
        />
      </div>

      {status === 'rejected' && (
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#b91c1c', marginBottom: '8px' }}>Rejection reason</label>
          <textarea
            name="rejectionReason"
            defaultValue={currentRejectionReason || ''}
            className="form-input"
            placeholder="Why was the visa rejected, and what's the next possible action?"
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #fecaca', fontSize: '14px', background: '#fef2f2', minHeight: '60px', resize: 'vertical' }}
          />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
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
