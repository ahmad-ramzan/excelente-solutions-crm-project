'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteResume, replaceResume } from '@/app/actions/resume-actions';
import FileUploadField from '@/app/components/FileUploadField';

export default function ResumeActions({ candidateId, hasResume }: { candidateId: string; hasResume: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<'idle' | 'replace'>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFile, setHasFile] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Delete this candidate's resume? This action cannot be undone.")) return;

    setLoading(true);
    setError(null);
    const res = await deleteResume(candidateId);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      router.refresh();
    }
  }

  async function handleReplace(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!hasFile) {
      setError('Please choose a file to upload.');
      return;
    }

    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.append('candidateId', candidateId);

    const res = await replaceResume(formData);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setMode('idle');
      setHasFile(false);
      router.refresh();
    }
  }

  if (mode === 'replace') {
    return (
      <form onSubmit={handleReplace} style={{ width: '100%', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {error && (
          <div style={{ padding: '8px 10px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', fontSize: '12px' }}>
            {error}
          </div>
        )}
        <FileUploadField
          name="file"
          label={hasResume ? 'New resume file' : 'Resume file'}
          accept="application/pdf,image/jpeg"
          onFilesChange={(files) => setHasFile(files.length > 0)}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="submit"
            disabled={loading}
            className="btn"
            style={{ flex: 1, justifyContent: 'center', background: 'var(--ink)', color: '#fff', border: 'none' }}
          >
            {loading ? <><span className="btn-spinner" />Saving...</> : 'Save'}
          </button>
          <button
            type="button"
            disabled={loading}
            className="btn btn-ghost"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => {
              setMode('idle');
              setError(null);
              setHasFile(false);
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div style={{ width: '100%', marginTop: '8px' }}>
      {error && (
        <div style={{ padding: '8px 10px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', fontSize: '12px', marginBottom: '8px' }}>
          {error}
        </div>
      )}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => setMode('replace')}
        >
          {hasResume ? 'Replace CV' : 'Upload CV'}
        </button>
        {hasResume && (
          <button
            type="button"
            disabled={loading}
            className="btn btn-ghost"
            style={{ flex: 1, justifyContent: 'center', color: 'var(--red)' }}
            onClick={handleDelete}
          >
            {loading ? <><span className="btn-spinner" />Deleting...</> : 'Delete CV'}
          </button>
        )}
      </div>
    </div>
  );
}
