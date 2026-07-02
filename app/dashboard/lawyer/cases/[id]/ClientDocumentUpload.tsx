'use client';

import { useState } from 'react';
import { uploadVisaDocument } from '@/app/actions/visa-actions';
import { useRouter } from 'next/navigation';

export default function ClientDocumentUpload({ 
  visaCaseId,
  candidateId 
}: { 
  visaCaseId: string,
  candidateId: string
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const docTypes = [
    { value: 'visa_application_slip', label: 'Visa Application Slip' },
    { value: 'approved_visa', label: 'Approved Visa' },
    { value: 'other', label: 'Other Document' }
  ];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append('visaCaseId', visaCaseId);
    formData.append('candidateId', candidateId);

    try {
      const result = await uploadVisaDocument(formData);
      if (result.error) {
        setError(result.error);
      } else {
        // Reset form
        (e.target as HTMLFormElement).reset();
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
        <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--slate)', marginBottom: '8px' }}>Document Type</label>
        <select 
          name="type" 
          className="form-input" 
          required
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line-2)', fontSize: '14px', background: 'var(--paper)' }}
        >
          {docTypes.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="form-group" style={{ marginBottom: '24px' }}>
        <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--slate)', marginBottom: '8px' }}>File</label>
        <input 
          type="file"
          name="file"
          required
          className="form-input" 
          style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--line-2)', fontSize: '13px', background: 'var(--paper)' }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="btn" 
          style={{ background: 'var(--ink)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
        >
          {isSubmitting ? 'Uploading...' : 'Upload Document'}
        </button>
      </div>
    </form>
  );
}
