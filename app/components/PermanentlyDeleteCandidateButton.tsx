'use client';

import { permanentlyDeleteCandidate } from '@/app/actions/candidate-actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function PermanentlyDeleteCandidateButton({ candidateId, candidateName }: { candidateId: string; candidateName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Permanently delete ${candidateName}? This cannot be undone — all their documents will be removed too.`)) {
      return;
    }

    setLoading(true);
    const res = await permanentlyDeleteCandidate(candidateId);
    setLoading(false);

    if (res.error) {
      alert(res.error);
    } else {
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="btn btn-ghost"
      style={{ color: 'var(--red)', padding: '8px 16px', fontSize: '13px' }}
    >
      {loading ? <><span className="btn-spinner" />Deleting...</> : 'Delete permanently'}
    </button>
  );
}
