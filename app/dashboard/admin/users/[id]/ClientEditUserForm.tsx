'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateUserRoleStatus, deleteUserByAdmin, updateUserStatus } from '@/app/actions/admin-actions';

export default function ClientEditUserForm({ user }: { user: { id: string; full_name: string; role: string; status: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [suspending, setSuspending] = useState(false);
  const hasLinkedRecords = deleteError.includes('linked records');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const res = await updateUserRoleStatus(user.id, formData);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push('/dashboard/admin/users');
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete ${user.full_name}? This permanently removes their login and profile. This cannot be undone.`
    );
    if (!confirmed) return;

    setDeleting(true);
    setDeleteError('');

    const res = await deleteUserByAdmin(user.id);

    if (res.error) {
      setDeleteError(res.error);
      setDeleting(false);
    } else {
      router.push('/dashboard/admin/users');
    }
  };

  const handleSuspend = async () => {
    setSuspending(true);
    const res = await updateUserStatus(user.id, 'suspended');
    setSuspending(false);

    if (res.error) {
      setDeleteError(res.error);
    } else {
      router.push('/dashboard/admin/users');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {error && <div style={{ color: 'var(--red)', fontSize: '13px', padding: '10px', background: '#fee2e2', borderRadius: '6px' }}>{error}</div>}

      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Role</label>
        <select
          name="role"
          defaultValue={user.role}
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px', color: 'var(--ink)' }}
        >
          <option value="admin">Admin</option>
          <option value="salesperson">Salesperson</option>
          <option value="agent">Agent</option>
          <option value="employer">Employer</option>
          <option value="lawyer">Lawyer</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Status</label>
        <select
          name="status"
          defaultValue={user.status}
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px', color: 'var(--ink)' }}
        >
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="btn"
          style={{ background: '#fff', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, opacity: deleting ? 0.7 : 1 }}
        >
          {deleting ? <><span className="btn-spinner" />Deleting...</> : 'Delete user'}
        </button>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn"
            style={{ background: '#fff', border: '1px solid var(--line-2)', color: 'var(--ink)', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn"
            style={{ background: 'linear-gradient(135deg, #7b61ff, #36b9ff)', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? <><span className="btn-spinner" />Saving...</> : 'Save changes'}
          </button>
        </div>
      </div>

      {deleteError && (
        <div style={{ padding: '10px', background: '#fee2e2', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' }}>
          <div style={{ color: '#dc2626', fontSize: '13px' }}>{deleteError}</div>
          {hasLinkedRecords && (
            <button
              type="button"
              onClick={handleSuspend}
              disabled={suspending}
              className="btn"
              style={{ background: '#fff', border: '1px solid #fecaca', color: '#dc2626', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, opacity: suspending ? 0.7 : 1 }}
            >
              {suspending ? <><span className="btn-spinner" />Suspending...</> : 'Suspend this user instead'}
            </button>
          )}
        </div>
      )}
    </form>
  );
}
