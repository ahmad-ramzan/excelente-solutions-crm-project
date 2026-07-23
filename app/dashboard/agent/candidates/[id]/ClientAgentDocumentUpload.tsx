'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadVisaDocument } from '@/app/actions/visa-actions';
import FileUploadField from '@/app/components/FileUploadField';

export default function ClientAgentDocumentUpload({
  candidateId,
  visaCaseId,
}: {
  candidateId: string;
  visaCaseId?: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFile, setHasFile] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const docTypes = [
    { value: 'passport_scan', label: 'Passport Scan' },
    { value: 'health_certificate', label: 'Health Certificate' },
    { value: 'experience_letter', label: 'Experience Letter' },
    { value: 'police_clearance', label: 'Police Clearance' },
    { value: 'education_document', label: 'Education / Skill Document' },
    { value: 'contract', label: 'Job Offer / Contract' },
    { value: 'other', label: 'Other Document' },
  ];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!hasFile) {
      setError('Please choose a file to upload.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append('candidateId', candidateId);
    if (visaCaseId) formData.append('visaCaseId', visaCaseId);

    try {
      const result = await uploadVisaDocument(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setResetKey(k => k + 1);
        setHasFile(false);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
      {error && (
        <div style={{ width: '100%', padding: '10px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      <div>
        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--slate)', marginBottom: '6px' }}>Document type</label>
        <select
          name="type"
          required
          style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--line-2)', fontSize: '13px', background: 'var(--paper)' }}
        >
          {docTypes.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div style={{ minWidth: '220px' }}>
        <FileUploadField
          key={resetKey}
          name="file"
          label="File"
          onFilesChange={(files) => setHasFile(files.length > 0)}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn"
        style={{ background: 'var(--ink)', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
      >
        {isSubmitting ? <><span className="btn-spinner" />Uploading…</> : 'Upload'}
      </button>
    </form>
  );
}
