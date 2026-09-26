'use client';

import { deleteCandidate } from '@/app/actions/candidate-actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteCandidateButton({ candidateId }: { candidateId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Move this candidate to trash? You can restore them later from the Trash page.')) {
      return;
    }

    setLoading(true);
    const res = await deleteCandidate(candidateId);
    if (res.error) {
      alert(res.error);
      setLoading(false);
    } else {
      router.push('/dashboard/agent/candidates');
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="btn btn-ghost"
      style={{ width: '100%', justifyContent: 'center', color: 'var(--red)', marginTop: '8px' }}
    >
      {loading ? <><span className="btn-spinner" />Moving to trash...</> : 'Move to trash'}
    </button>
  );
}
