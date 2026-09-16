'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadVisaDocument } from '@/app/actions/visa-actions';

export default function AgentUploadVisaButton({ candidateId, visaCaseId }: { candidateId: string; visaCaseId?: string }) {
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
    formData.append('candidateId', candidateId);
    formData.append('type', 'visa_application_slip');
    if (visaCaseId) formData.append('visaCaseId', visaCaseId);

    const res = await uploadVisaDocument(formData);
    setBusy(false);

    if (res.error) {
      alert(res.error);
    } else {
      router.refresh();
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png"
        style={{ display: 'none' }}
        onChange={handleFileChosen}
      />
      <button
        type="button"
        className="btn btn-ghost"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        style={{ fontSize: '12px', padding: '6px 12px' }}
      >
        {busy ? <><span className="btn-spinner" />Uploading...</> : '+ Upload Visa'}
      </button>
    </>
  );
}
