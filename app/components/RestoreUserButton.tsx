'use client';

import { restoreUserByAdmin } from '@/app/actions/admin-actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RestoreUserButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRestore = async () => {
    setLoading(true);
    const res = await restoreUserByAdmin(userId);
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
      onClick={handleRestore}
      disabled={loading}
      className="btn"
      style={{ background: 'var(--ink)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
    >
      {loading ? <><span className="btn-spinner" />Restoring...</> : 'Restore'}
    </button>
  );
}
