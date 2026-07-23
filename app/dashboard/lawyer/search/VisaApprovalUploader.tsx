'use client';

import { uploadLawyerDocument } from '@/app/actions/lawyer-document-actions';
import { useState } from 'react';

export default function VisaApprovalUploader({ candidateId, visaCaseId }: { candidateId: string, visaCaseId: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5 MB limit. Please select a smaller file.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('candidateId', candidateId);
    formData.append('visaCaseId', visaCaseId);
    formData.append('type', 'approved_visa');

    const res = await uploadLawyerDocument(formData);

    setLoading(false);
    if (!res?.error) {
      setSuccess(true);
    } else {
      setError(res.error);
    }
  };

  return (
    <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid var(--line)' }}>
      <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Upload Visa Approval</h4>
      <p style={{ fontSize: '13px', color: 'var(--slate)', marginBottom: '16px' }}>Upload the final approved visa PDF here. This will be shared with the Agent and Employer.</p>

      {error && <div style={{ marginBottom: '16px', color: '#e11d48', fontSize: '13px' }}>{error}</div>}
      {success && <div style={{ marginBottom: '16px', color: '#008a3d', fontSize: '13px' }}>Visa approval document uploaded successfully!</div>}

      <label className="btn btn-gold" style={{ display: 'inline-flex', padding: '10px 20px', fontSize: '14px', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
        {loading ? 'Uploading...' : 'Select PDF File'}
        <input type="file" hidden accept="application/pdf" onChange={handleUpload} disabled={loading} />
      </label>
    </div>
  );
}
