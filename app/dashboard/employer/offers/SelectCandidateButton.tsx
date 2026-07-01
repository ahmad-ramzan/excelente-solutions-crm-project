'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { selectCandidate } from '@/app/actions/employer-actions';

export default function SelectCandidateButton({ jobOfferId, candidateId }: { jobOfferId: string; candidateId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    const result = await selectCandidate(jobOfferId, candidateId);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push('/dashboard/employer/selections');
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="btn"
        style={{ background: 'linear-gradient(135deg, #7b61ff, #36b9ff)', border: 'none', color: '#fff', padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
      >
        {loading ? 'Placing…' : 'Place here'}
      </button>
      {error && (
        <div style={{ color: '#b91c1c', fontSize: '12px', marginTop: '6px', maxWidth: '220px' }}>{error}</div>
      )}
    </div>
  );
}
