'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createMultipleJobOffers } from '@/app/actions/employer-actions';
import FileUploadField from '@/app/components/FileUploadField';

interface Vacancy {
  id: number;
  positionId: string;
  staffNeeded: string;
  salaryAmount: string;
  startDate: string;
  endDate: string;
  cityOfEmployment: string;
  flightTicket: string;
  pickup: string;
  accommodation: string;
}

export default function ClientOfferForm({ 
  employerId, 
  employerName, 
  countryId, 
  countryName,
  positions
}: {
  employerId: string;
  employerName: string;
  countryId: string;
  countryName: string;
  positions: { id: string, name: string }[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [vacancies, setVacancies] = useState<Vacancy[]>([{
    id: 1,
    positionId: '',
    staffNeeded: '1',
    salaryAmount: '',
    startDate: '',
    endDate: '',
    cityOfEmployment: '',
    flightTicket: 'false',
    pickup: 'false',
    accommodation: 'false'
  }]);

  const addVacancy = () => {
    setVacancies([...vacancies, {
      id: Date.now(),
      positionId: '',
      staffNeeded: '1',
      salaryAmount: '',
      startDate: '',
      endDate: '',
      cityOfEmployment: '',
      flightTicket: 'false',
      pickup: 'false',
      accommodation: 'false'
    }]);
  };

  const removeVacancy = (id: number) => {
    if (vacancies.length > 1) {
      setVacancies(vacancies.filter(v => v.id !== id));
    }
  };

  const updateVacancy = (id: number, field: keyof Vacancy, value: string) => {
    setVacancies(vacancies.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate that all positions are selected
    if (vacancies.some(v => !v.positionId)) {
      setError("Please select a position for all vacancies.");
      setIsSubmitting(false);
      return;
    }

    // Contract with Candidate is required for every vacancy — lawyers and agents rely on it.
    const missingContract = vacancies.some((_, index) => {
      const input = e.currentTarget.querySelector(`input[name="contractWithCandidate-${index}"]`) as HTMLInputElement | null;
      return !input?.files || input.files.length === 0;
    });
    if (missingContract) {
      setError("Please upload the Contract with Candidate for every vacancy.");
      setIsSubmitting(false);
      return;
    }

    // Client-side file size validation (5 MB max per file)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const fileInputs = e.currentTarget.querySelectorAll('input[type="file"]');
    for (const input of Array.from(fileInputs) as HTMLInputElement[]) {
      if (input.files) {
        for (const file of Array.from(input.files)) {
          if (file.size > MAX_FILE_SIZE) {
            setError(`File "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 5 MB per file.`);
            setIsSubmitting(false);
            return;
          }
        }
      }
    }

    const payload = vacancies.map(v => ({
      ...v,
      employerId,
      countryId
    }));

    const formData = new FormData(e.currentTarget);
    formData.set('offers', JSON.stringify(payload));

    try {
      const result = await createMultipleJobOffers(formData);
      
      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
      } else {
        router.push('/dashboard/employer/offers');
      }
    } catch (err: any) {
      console.error('Job offer submission failed:', err);
      setError(err.message || 'Upload failed. The files may be too large, or your connection dropped. Please reduce the file sizes and try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: '32px 40px', background: 'var(--card)', borderRadius: '16px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
      {error && (
        <div style={{ padding: '14px 16px', background: '#fee2e2', color: '#991b1b', borderRadius: '10px', marginBottom: '24px', fontSize: '14px', lineHeight: '1.5', border: '1px solid #fecaca' }}>
          <strong style={{ display: 'block', marginBottom: '4px' }}>⚠ Error</strong>
          {error}
        </div>
      )}
      
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>Employer Info</h2>
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Employer</label>
            <input type="text" readOnly value={`${employerName}`} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#f8fafc', fontSize: '14px', color: 'var(--slate)', cursor: 'not-allowed' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Destination Country</label>
            <input type="text" readOnly value={countryName} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#f8fafc', fontSize: '14px', color: 'var(--slate)', cursor: 'not-allowed' }} />
          </div>
        </div>
      </div>

      <div style={{ height: '1px', background: 'var(--line)', margin: '32px 0' }}></div>

      {vacancies.map((vacancy, index) => (
        <div key={vacancy.id} style={{ marginBottom: '40px', padding: '24px', border: '1px solid var(--line-2)', borderRadius: '12px', position: 'relative' }}>
          
          {vacancies.length > 1 && (
            <button type="button" onClick={() => removeVacancy(vacancy.id)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
              Remove
            </button>
          )}

          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink)', marginBottom: '24px' }}>Vacancy Position {index + 1}</h3>

          <div className="resp-grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Position</label>
              <select required value={vacancy.positionId} onChange={(e) => updateVacancy(vacancy.id, 'positionId', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '14px', color: 'var(--ink)' }}>
                <option value="">Select a position...</option>
                {positions.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>City of Employment</label>
              <input type="text" value={vacancy.cityOfEmployment} onChange={(e) => updateVacancy(vacancy.id, 'cityOfEmployment', e.target.value)} placeholder="e.g. Athens" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '14px', color: 'var(--ink)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Number of staff needed</label>
              <input type="number" required min="1" value={vacancy.staffNeeded} onChange={(e) => updateVacancy(vacancy.id, 'staffNeeded', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '14px', color: 'var(--ink)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Net Salary per month</label>
              <input type="number" min="0" step="0.01" placeholder="0.00" value={vacancy.salaryAmount} onChange={(e) => updateVacancy(vacancy.id, 'salaryAmount', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '14px', color: 'var(--ink)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Start Date Of Employment</label>
              <input type="date" value={vacancy.startDate} onChange={(e) => updateVacancy(vacancy.id, 'startDate', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '14px', color: 'var(--ink)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>End Date Of Employment</label>
              <input type="date" value={vacancy.endDate} onChange={(e) => updateVacancy(vacancy.id, 'endDate', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '14px', color: 'var(--ink)' }} />
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Flight ticket</label>
              <select value={vacancy.flightTicket} onChange={(e) => updateVacancy(vacancy.id, 'flightTicket', e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff' }}>
                <option value="true">YES</option>
                <option value="false">NO</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Pickup at airport</label>
              <select value={vacancy.pickup} onChange={(e) => updateVacancy(vacancy.id, 'pickup', e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff' }}>
                <option value="true">YES</option>
                <option value="false">NO</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Accommodation</label>
              <select value={vacancy.accommodation} onChange={(e) => updateVacancy(vacancy.id, 'accommodation', e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff' }}>
                <option value="true">YES</option>
                <option value="false">NO</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '24px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>Attachments</h4>
            <p style={{ fontSize: '11.5px', color: 'var(--slate)', margin: '0 0 12px' }}>
              Fields marked * are required. The Contract with Candidate is visible to the assigned lawyer and agent.
            </p>
            <div className="resp-grid-2">
              <FileUploadField
                name={`accommodationPhotos-${index}`}
                label="Upload photos of Accommodation"
                accept="image/*"
                multiple
              />
              <FileUploadField
                name={`contractWithExcelente-${index}`}
                label="Add Contract with Excelente"
                accept="application/pdf"
              />
              <FileUploadField
                name={`contractWithCandidate-${index}`}
                label="Upload Contract with Candidate *"
                accept="application/pdf"
              />
              <FileUploadField
                name={`workplacePhotos-${index}`}
                label="Add photos of Workplace"
                accept="image/*"
                multiple
              />
              <FileUploadField
                name={`flightTicketPdf-${index}`}
                label="Add Flight Ticket PDF"
                accept="application/pdf"
              />
              <FileUploadField
                name={`additionalPdfs-${index}`}
                label="Add PDF"
                accept="application/pdf"
                multiple
              />
            </div>
          </div>

        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
        <button type="button" onClick={addVacancy} className="btn btn-outline" style={{ border: '2px dashed var(--line-2)', width: '100%', padding: '16px', color: 'var(--brand)', fontWeight: 600, borderRadius: '12px' }}>
          + GENERATE JOB POSITION
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button type="button" onClick={() => router.back()} className="btn" style={{ background: '#fff', border: '1px solid var(--line-2)', color: 'var(--ink)', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn btn-gold" style={{ border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
          {isSubmitting ? <><span className="btn-spinner" />Submitting...</> : 'Save All Vacancies'}
        </button>
      </div>

    </form>
  );
}
