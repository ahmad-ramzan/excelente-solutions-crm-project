'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { assignSalesperson } from '@/app/actions/admin-actions';

export default function AssignSalespersonCell({
  employerId,
  currentSalespersonId,
  salespersons,
}: {
  employerId: string;
  currentSalespersonId: string | null;
  salespersons: { id: string; full_name: string }[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(currentSalespersonId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAssign = async () => {
    if (selected === (currentSalespersonId || '')) return;
    setLoading(true);
    setError(null);

    const result = await assignSalesperson(employerId, selected);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.refresh();
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--line-2)', fontSize: '12.5px', background: '#fff' }}
      >
        <option value="">Unassigned</option>
        {salespersons.map(s => (
          <option key={s.id} value={s.id}>{s.full_name}</option>
        ))}
      </select>
      <button
        onClick={handleAssign}
        disabled={loading || selected === (currentSalespersonId || '')}
        className="btn"
        style={{ background: '#fff', border: '1px solid var(--line-2)', color: 'var(--ink)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
      >
        {loading ? 'Saving…' : 'Save'}
      </button>
      {error && <div style={{ color: '#b91c1c', fontSize: '11px' }}>{error}</div>}
    </div>
  );
}
