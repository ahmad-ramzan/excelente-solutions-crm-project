'use client';

import { useRef, useState } from 'react';

const MAX_BYTES = 5 * 1024 * 1024;

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function acceptLabel(accept?: string) {
  if (!accept) return 'Any file';
  if (accept.startsWith('image/')) return 'PNG, JPG';
  if (accept === 'application/pdf') return 'PDF';
  return accept;
}

/**
 * Styled file picker that still renders a real <input type="file"> so the
 * surrounding form keeps working unchanged (FormData + the submit-time size
 * check both rely on the native input being present with its `name`).
 */
export default function FileUploadField({
  name,
  label,
  accept,
  multiple = false,
  hint = 'Max 5 MB per file',
}: {
  name: string;
  label: string;
  accept?: string;
  multiple?: boolean;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);

  // Keep the native input's FileList in sync so the form submits what's shown.
  function sync(list: File[]) {
    const dt = new DataTransfer();
    list.forEach((f) => dt.items.add(f));
    if (inputRef.current) inputRef.current.files = dt.files;
    setFiles(list);
  }

  function onPicked(picked: FileList | null) {
    if (!picked || picked.length === 0) return;
    const next = Array.from(picked);
    sync(multiple ? [...files, ...next] : next.slice(0, 1));
  }

  function removeAt(index: number) {
    sync(files.filter((_, i) => i !== index));
  }

  return (
    <div className="upl">
      <span className="upl-label">{label}</span>

      <button
        type="button"
        className={`upl-zone${dragging ? ' is-drag' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          onPicked(e.dataTransfer.files);
        }}
      >
        <span className="upl-ic" aria-hidden="true">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </span>
        <span className="upl-txt">
          <span className="upl-main">
            {files.length === 0
              ? 'Click to upload or drag and drop'
              : `${files.length} file${files.length > 1 ? 's' : ''} selected — add more`}
          </span>
          <span className="upl-sub">
            {acceptLabel(accept)} · {hint}
          </span>
        </span>
      </button>

      {/* Real input — hidden, but still submitted with the form. */}
      <input
        ref={inputRef}
        name={name}
        type="file"
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={(e) => onPicked(e.target.files)}
      />

      {files.length > 0 && (
        <div className="upl-list">
          {files.map((f, i) => {
            const tooBig = f.size > MAX_BYTES;
            return (
              <div key={`${f.name}-${i}`} className={`upl-file${tooBig ? ' is-bad' : ''}`}>
                <span className="upl-name" title={f.name}>{f.name}</span>
                <span className="upl-size">
                  {formatSize(f.size)}{tooBig ? ' · too large' : ''}
                </span>
                <button
                  type="button"
                  className="upl-x"
                  onClick={() => removeAt(i)}
                  aria-label={`Remove ${f.name}`}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
