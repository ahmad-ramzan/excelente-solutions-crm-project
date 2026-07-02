'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { reassignLawyer } from '@/app/actions/visa-actions';

export default function ReassignLawyerForm({
  visaCaseId,
  currentLawyerId,
  lawyers,
}: {
  visaCaseId: string;
  currentLawyerId: string | null;
  lawyers: { id: string; full_name: string }[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(currentLawyerId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReassign = async () => {
    if (!selected || selected === currentLawyerId) return;
    setLoading(true);
    setError(null);

    const result = await reassignLawyer(visaCaseId, selected);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.refresh();
  };

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: '10px' }}>
        <select
          className="input"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          style={{ appearance: 'none', paddingRight: '36px' }}
        >
          <option value="" disabled>Select lawyer</option>
          {lawyers.map((l) => (
            <option key={l.id} value={l.id}>{l.full_name}</option>
          ))}
        </select>
      </div>
      <button
        onClick={handleReassign}
        disabled={loading || !selected || selected === currentLawyerId}
        className="btn btn-gold"
        style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
      >
        {loading ? 'Saving…' : currentLawyerId ? 'Reassign lawyer' : 'Assign lawyer'}
      </button>
      {error && (
        <div style={{ color: '#b91c1c', fontSize: '12px', marginTop: '8px' }}>{error}</div>
      )}
    </div>
  );
}
