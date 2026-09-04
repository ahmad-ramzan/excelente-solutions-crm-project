'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteCandidateDocument, replaceCandidateDocument } from '@/app/actions/document-actions';

export default function DocumentRowActions({ documentId }: { documentId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setBusy(true);
    const formData = new FormData();
    formData.append('file', file);
    const res = await replaceCandidateDocument(documentId, formData);
    setBusy(false);

    if (res.error) {
      alert(res.error);
    } else {
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this document? This action cannot be undone.')) return;

    setBusy(true);
    const res = await deleteCandidateDocument(documentId);
    setBusy(false);

    if (res.error) {
      alert(res.error);
    } else {
      router.refresh();
    }
  }

  return (
    <>
      <input ref={inputRef} type="file" style={{ display: 'none' }} onChange={handleFileChosen} />
      <button
        type="button"
        className="ico-btn"
        title="Replace file"
        aria-label="Replace file"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        ✎
      </button>
      <button
        type="button"
        className="ico-btn"
        title="Delete document"
        aria-label="Delete document"
        disabled={busy}
        style={{ color: 'var(--red)' }}
        onClick={handleDelete}
      >
        ✕
      </button>
    </>
  );
}
