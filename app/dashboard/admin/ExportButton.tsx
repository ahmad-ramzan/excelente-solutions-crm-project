'use client';

import { useState } from 'react';
import { exportPlatformData } from '@/app/actions/export-actions';

export default function ExportButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setError(null);

    const result = await exportPlatformData();

    if (result.error || !result.base64) {
      setError(result.error || 'Export failed');
      setLoading(false);
      return;
    }

    const byteChars = atob(result.base64);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }
    const blob = new Blob([new Uint8Array(byteNumbers)], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `excelente-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setLoading(false);
  };

  return (
    <div>
      <button className="btn btn-ghost btn-sm" onClick={handleExport} disabled={loading}>
        {loading ? 'Exporting…' : 'Export'}
      </button>
      {error && (
        <div style={{ color: '#b91c1c', fontSize: '12px', marginTop: '6px' }}>{error}</div>
      )}
    </div>
  );
}
