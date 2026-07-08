'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadCandidateDocument } from '@/app/actions/agent-document-actions';


export default function AgentDocumentManager({ candidateId, existingDocs }: { candidateId: string, existingDocs: any[] }) {
  const router = useRouter();
  const [loadingType, setLoadingType] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1048576) {
      alert('File size exceeds 1 MB limit. Please select a smaller file.');
      return;
    }

    setLoadingType(type);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('candidateId', candidateId);
    formData.append('type', type);

    const res = await uploadCandidateDocument(formData);

    setLoadingType(null);
    if (!res?.error) {
      router.refresh();
    } else {
      alert(res.error);
    }
  };

  // Helper to find a specific document type
  const getDoc = (type: string) => existingDocs.find(d => d.type === type);
  // Specifically for contract, Employer uploads one, Candidate uploads one.
  // Assuming Employer uploaded 'contract' (we can check uploaded_by role if needed, or assume if it's there, agent can download)
  const contracts = existingDocs.filter(d => d.type === 'contract');

  return (
    <div>
      <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)', marginBottom: '16px' }}>Manage Documents</h4>

      <div className="resp-grid-2">
        {/* Contracts */}
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--line)' }}>
          <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '13.5px', marginBottom: '12px' }}>Contracts</div>
          {contracts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {contracts.map(c => (
                <a key={c.id} href={`https://vrtvqqqjydyhtdcehtqn.supabase.co/storage/v1/object/public/candidate-documents/${c.file_path}`} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: 'var(--brand)', textDecoration: 'underline' }}>
                  📄 {c.file_name || 'Contract'}
                </a>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '12px', color: 'var(--slate)', marginBottom: '12px' }}>No contracts uploaded yet.</p>
          )}

          <label className="btn btn-outline" style={{ display: 'inline-flex', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', opacity: loadingType === 'contract' ? 0.7 : 1 }}>
            {loadingType === 'contract' ? 'Uploading...' : 'Upload Candidate Signed Contract'}
            <input type="file" hidden accept="application/pdf" onChange={(e) => handleUpload(e, 'contract')} disabled={loadingType === 'contract'} />
          </label>
        </div>

        {/* Passport */}
        <DocUploaderCard type="passport_scan" title="Passport PDF" doc={getDoc('passport_scan')} loading={loadingType === 'passport_scan'} onUpload={(e) => handleUpload(e, 'passport_scan')} />

        {/* Health Certificate */}
        <DocUploaderCard type="health_certificate" title="Health Certificate" doc={getDoc('health_certificate')} loading={loadingType === 'health_certificate'} onUpload={(e) => handleUpload(e, 'health_certificate')} />

        {/* Travel Insurance */}
        <DocUploaderCard type="travel_insurance" title="Travel Insurance" doc={getDoc('travel_insurance')} loading={loadingType === 'travel_insurance'} onUpload={(e) => handleUpload(e, 'travel_insurance')} />

        {/* Flight Ticket */}
        <DocUploaderCard type="flight_ticket" title="Flight Ticket" doc={getDoc('flight_ticket')} loading={loadingType === 'flight_ticket'} onUpload={(e) => handleUpload(e, 'flight_ticket')} />
      </div>
    </div>
  );
}

function DocUploaderCard({ type, title, doc, loading, onUpload }: { type: string, title: string, doc: any, loading: boolean, onUpload: (e: any) => void }) {
  return (
    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--line)' }}>
      <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '13.5px', marginBottom: '12px' }}>{title}</div>
      {doc ? (
        <a href={`https://vrtvqqqjydyhtdcehtqn.supabase.co/storage/v1/object/public/candidate-documents/${doc.file_path}`} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: 'var(--brand)', textDecoration: 'underline', display: 'block', marginBottom: '12px' }}>
          📄 {doc.file_name || `${title} Document`}
        </a>
      ) : (
        <p style={{ fontSize: '12px', color: 'var(--slate)', marginBottom: '12px' }}>Not uploaded</p>
      )}

      <label className="btn btn-outline" style={{ display: 'inline-flex', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
        {loading ? 'Uploading...' : 'Upload'}
        <input type="file" hidden accept="application/pdf,image/*" onChange={onUpload} disabled={loading} />
      </label>
    </div>
  );
}
