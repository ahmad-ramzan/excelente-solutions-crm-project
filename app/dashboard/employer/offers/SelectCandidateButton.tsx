'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { selectCandidate } from '@/app/actions/employer-actions';

export default function SelectCandidateButton({ jobOfferId, candidateId }: { jobOfferId: string; candidateId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleConfirm = async () => {
    if (!file) {
      setError("Please upload the signed contract PDF to proceed.");
      return;
    }

    setLoading(true);
    setError(null);

    // In a real app, upload the file to Supabase Storage here and pass the URL to selectCandidate.
    // We are simulating the upload for now as requested.

    const result = await selectCandidate(jobOfferId, candidateId);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setShowModal(false);
    router.push('/dashboard/employer/selections');
  };

  return (
    <div>
      <button
        onClick={() => setShowModal(true)}
        className="btn"
        style={{ background: 'linear-gradient(135deg, #7b61ff, #36b9ff)', border: 'none', color: '#fff', padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
      >
        Place here
      </button>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600, color: 'var(--ink)' }}>Confirm Selection</h3>
            <p style={{ fontSize: '14px', color: 'var(--slate)', marginBottom: '24px' }}>Please upload the signed contract (PDF) with the candidate to finalize the placement.</p>
            
            <input 
              type="file" 
              accept=".pdf" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ display: 'block', width: '100%', padding: '12px', border: '1px dashed var(--brand)', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}
            />

            {error && (
              <div style={{ color: '#b91c1c', fontSize: '12.5px', marginBottom: '16px' }}>{error}</div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => { setShowModal(false); setError(null); }} 
                className="btn btn-outline" 
                style={{ padding: '8px 16px' }}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirm} 
                className="btn btn-gold" 
                style={{ padding: '8px 16px', opacity: loading ? 0.7 : 1 }}
                disabled={loading}
              >
                {loading ? <><span className="btn-spinner"/> Confirming...</> : 'Confirm Selection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

