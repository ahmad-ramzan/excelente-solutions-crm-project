'use client';

import { permanentlyDeleteUserByAdmin } from '@/app/actions/admin-actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function PermanentlyDeleteUserButton({ userId, userName }: { userId: string; userName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Permanently delete ${userName}? This removes their login and profile for good — it cannot be undone.`)) {
      return;
    }

    setLoading(true);
    const res = await permanentlyDeleteUserByAdmin(userId);
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
