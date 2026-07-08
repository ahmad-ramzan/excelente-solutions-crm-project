'use client';

import { createCandidate } from '@/app/actions/candidate-actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ClientForm({ countries, positions }: { countries: any[], positions: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const positions = formData.getAll('positions');
    
    if (positions.length > 3) {
      setError('Candidate can apply for a maximum of 3 positions.');
      setLoading(false);
      return;
    }

    // Validate file sizes (1MB limit for Next.js default server action)
    const photo = formData.get('photo') as File;
    const cv = formData.get('cv') as File;
    const workExpFiles = formData.getAll('workExperience') as File[];

    let totalSize = 0;
    if (photo?.size) totalSize += photo.size;
    if (cv?.size) totalSize += cv.size;
    workExpFiles.forEach(f => {
      if (f?.size) totalSize += f.size;
    });

    // 1 MB = 1048576 bytes
    if (totalSize > 1048576) {
      setError('Total file size exceeds 1 MB limit. Please compress your files or select smaller ones.');
      setLoading(false);
      return;
    }

    const isAnyCountry = formData.get('openToAllCountries') === 'on';
    const selectedCountries = formData.getAll('countries');

    if (!isAnyCountry && selectedCountries.length === 0) {
      setError('Please select at least one country or choose "Any Country".');
      setLoading(false);
      return;
    }

    const res = await createCandidate(formData);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push('/dashboard/agent/candidates');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
      {error && <div style={{ color: 'var(--red)', fontSize: '13px', padding: '10px', background: '#fee2e2', borderRadius: '6px', marginBottom: '20px' }}>{error}</div>}
      
      {/* Section 1: Personal information */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ width: '24px', height: '24px', background: 'var(--ink)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
          1
        </div>
        <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>Personal information</h2>
      </div>

      <div className="resp-grid-2">
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>First name</label>
          <input name="firstName" required type="text" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px', color: 'var(--ink)' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Last name</label>
          <input name="lastName" required type="text" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px', color: 'var(--ink)' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Date of birth</label>
          <input name="dateOfBirth" type="date" required style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px', color: 'var(--ink)' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Gender</label>
          <select name="gender" required style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px', color: 'var(--ink)', appearance: 'none' }}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>

      <div style={{ height: '1px', background: 'var(--line)', margin: '32px 0' }}></div>

      {/* Section 2: Contact information */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '24px', height: '24px', background: 'var(--ink)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
            2
          </div>
          <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>Contact information</h2>
        </div>
      </div>

      <div className="resp-grid-3">
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Phone</label>
          <input name="phone" type="text" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px', color: 'var(--ink)' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Email</label>
          <input name="email" type="email" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px', color: 'var(--ink)' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Address</label>
          <input name="address" type="text" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px', color: 'var(--ink)' }} />
        </div>
      </div>

      <div style={{ height: '1px', background: 'var(--line)', margin: '32px 0' }}></div>

      {/* Section 3: Visa & passport */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ width: '24px', height: '24px', background: 'var(--ink)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
          3
        </div>
        <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>Visa & passport</h2>
      </div>

      <div className="resp-grid-2">
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Destination Country (Select multiple or Any)</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: 'var(--ink)', cursor: 'pointer' }}>
              <input type="checkbox" name="openToAllCountries" style={{ width: '16px', height: '16px' }} />
              Open to Any Country
            </label>
            <select name="countries" multiple style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px', color: 'var(--ink)', minHeight: '100px' }}>
              {countries.map(c => <option key={c.id} value={c.id} style={{ padding: '4px' }}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>City of visa application</label>
          <input name="city" type="text" defaultValue="Lahore" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px', color: 'var(--ink)' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Passport number</label>
          <input name="passportNumber" required type="text" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px', color: 'var(--ink)' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Passport expiry</label>
          <input name="passportExpiry" required type="date" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px', color: 'var(--ink)' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Available From</label>
          <input name="availableFrom" type="date" required style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px', color: 'var(--ink)' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Available Until</label>
          <input name="availableUntil" type="date" required style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px', color: 'var(--ink)' }} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Languages Spoken (Comma separated)</label>
          <input name="languages" type="text" placeholder="e.g. English, Spanish, Arabic" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px', color: 'var(--ink)' }} />
        </div>
      </div>

      <div style={{ height: '1px', background: 'var(--line)', margin: '32px 0' }}></div>

      {/* Section 4: Positions applied for */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ width: '24px', height: '24px', background: 'var(--ink)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
          4
        </div>
        <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>Positions applied for</h2>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Select positions (Ctrl/Cmd to select multiple)</label>
        <select name="positions" required multiple style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px', color: 'var(--ink)', minHeight: '120px' }}>
          {positions.map(p => <option key={p.id} value={p.id} style={{ padding: '4px' }}>{p.name}</option>)}
        </select>
      </div>
      <p style={{ fontSize: '11.5px', color: 'var(--slate)', margin: 0, marginBottom: '24px' }}>
        Positions are managed by the admin and reused across the system. A candidate can apply for several.
      </p>

      <div style={{ height: '1px', background: 'var(--line)', margin: '32px 0' }}></div>

      {/* Section 5: Documents */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ width: '24px', height: '24px', background: 'var(--ink)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
          5
        </div>
        <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>Documents</h2>
      </div>

      <div className="resp-grid-2" style={{ marginBottom: '40px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Candidate photo</label>
          <input name="photo" type="file" accept="image/jpeg,image/png" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px dashed var(--line)', background: 'var(--paper)' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>PDF Resume / CV</label>
          <input name="cv" type="file" accept="application/pdf,image/jpeg" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px dashed var(--line)', background: 'var(--paper)' }} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Work Experience Photos/Videos</label>
          <input name="workExperience" type="file" multiple accept="image/*,video/*" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px dashed var(--line)', background: 'var(--paper)' }} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button type="button" onClick={() => router.back()} className="btn" style={{ background: '#fff', border: '1px solid var(--line-2)', color: 'var(--ink)', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn" style={{ background: 'linear-gradient(135deg, #7b61ff, #36b9ff)', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
          {loading ? <><span className="btn-spinner" />Saving...</> : 'Save candidate'}
        </button>
      </div>
    </form>
  );
}
