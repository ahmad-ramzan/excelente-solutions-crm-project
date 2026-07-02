'use server';

import { createClient } from '@/utils/supabase/server';
import ExcelJS from 'exceljs';

function addSheet(workbook: ExcelJS.Workbook, name: string, columns: { header: string; key: string; width?: number }[], rows: Record<string, any>[]) {
  const sheet = workbook.addWorksheet(name);
  sheet.columns = columns;
  sheet.getRow(1).font = { bold: true };
  rows.forEach(row => sheet.addRow(row));
  return sheet;
}

export async function exportPlatformData() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: callerProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (callerProfile?.role !== 'admin') return { error: 'Only admins can export platform data' };

  const [{ data: candidates }, { data: offers }, { data: selections }, { data: visaCases }, { data: users }, { data: countries }, { data: positions }] = await Promise.all([
    supabase.from('candidates').select('public_code, first_name, last_name, nationality, status, created_at, countries(name), profiles(full_name), candidate_positions(positions(name))'),
    supabase.from('job_offers').select('public_code, staff_needed, status, start_date, end_date, created_at, employers(name), countries(name), positions(name)'),
    supabase.from('job_offer_selections').select('job_offer_id, status'),
    supabase.from('visa_cases').select('public_code, status, opened_at, approved_at, candidates(first_name, last_name), employers(name), countries(name), profiles!lawyer_id(full_name)'),
    supabase.from('profiles').select('full_name, email, role, status, created_at'),
    supabase.from('countries').select('name, code, is_active'),
    supabase.from('positions').select('name, is_active'),
  ]);

  const filledByOffer: Record<string, number> = {};
  (selections || []).forEach(s => {
    if (s.status !== 'cancelled') {
      filledByOffer[s.job_offer_id] = (filledByOffer[s.job_offer_id] || 0) + 1;
    }
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Excelente Solutions';
  workbook.created = new Date();

  addSheet(workbook, 'Candidates',
    [
      { header: 'Code', key: 'code', width: 14 },
      { header: 'Name', key: 'name', width: 24 },
      { header: 'Nationality', key: 'nationality', width: 16 },
      { header: 'Destination', key: 'country', width: 16 },
      { header: 'Positions', key: 'positions', width: 28 },
      { header: 'Status', key: 'status', width: 16 },
      { header: 'Agent', key: 'agent', width: 22 },
      { header: 'Registered', key: 'created_at', width: 14 },
    ],
    (candidates || []).map((c: any) => ({
      code: c.public_code,
      name: `${c.first_name} ${c.last_name}`,
      nationality: c.nationality || '',
      country: c.countries?.name || '',
      positions: (c.candidate_positions || []).map((cp: any) => cp.positions?.name).filter(Boolean).join(', '),
      status: c.status,
      agent: c.profiles?.full_name || '',
      created_at: c.created_at ? new Date(c.created_at).toLocaleDateString() : '',
    }))
  );

  addSheet(workbook, 'Job Offers',
    [
      { header: 'Code', key: 'code', width: 14 },
      { header: 'Employer', key: 'employer', width: 24 },
      { header: 'Country', key: 'country', width: 16 },
      { header: 'Position', key: 'position', width: 18 },
      { header: 'Staff needed', key: 'staff_needed', width: 12 },
      { header: 'Filled', key: 'filled', width: 10 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Start date', key: 'start_date', width: 14 },
      { header: 'End date', key: 'end_date', width: 14 },
    ],
    (offers || []).map((o: any) => ({
      code: o.public_code,
      employer: o.employers?.name || '',
      country: o.countries?.name || '',
      position: o.positions?.name || '',
      staff_needed: o.staff_needed,
      filled: filledByOffer[o.public_code] || 0,
      status: o.status,
      start_date: o.start_date || '',
      end_date: o.end_date || '',
    }))
  );

  addSheet(workbook, 'Visa Processes',
    [
      { header: 'Case', key: 'code', width: 14 },
      { header: 'Candidate', key: 'candidate', width: 24 },
      { header: 'Employer', key: 'employer', width: 24 },
      { header: 'Country', key: 'country', width: 16 },
      { header: 'Lawyer', key: 'lawyer', width: 22 },
      { header: 'Status', key: 'status', width: 20 },
      { header: 'Opened', key: 'opened_at', width: 14 },
      { header: 'Approved', key: 'approved_at', width: 14 },
    ],
    (visaCases || []).map((v: any) => ({
      code: v.public_code,
      candidate: v.candidates ? `${v.candidates.first_name} ${v.candidates.last_name}` : '',
      employer: v.employers?.name || '',
      country: v.countries?.name || '',
      lawyer: v.profiles?.full_name || 'Unassigned',
      status: v.status,
      opened_at: v.opened_at ? new Date(v.opened_at).toLocaleDateString() : '',
      approved_at: v.approved_at ? new Date(v.approved_at).toLocaleDateString() : '',
    }))
  );

  addSheet(workbook, 'Users',
    [
      { header: 'Name', key: 'name', width: 24 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Role', key: 'role', width: 14 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Joined', key: 'created_at', width: 14 },
    ],
    (users || []).map((u: any) => ({
      name: u.full_name,
      email: u.email,
      role: u.role,
      status: u.status,
      created_at: u.created_at ? new Date(u.created_at).toLocaleDateString() : '',
    }))
  );

  const countryPositionSheet = workbook.addWorksheet('Countries & Positions');
  countryPositionSheet.columns = [
    { header: 'Type', key: 'type', width: 12 },
    { header: 'Name', key: 'name', width: 24 },
    { header: 'Code', key: 'code', width: 10 },
    { header: 'Active', key: 'active', width: 10 },
  ];
  countryPositionSheet.getRow(1).font = { bold: true };
  (countries || []).forEach((c: any) => countryPositionSheet.addRow({ type: 'Country', name: c.name, code: c.code, active: c.is_active ? 'Yes' : 'No' }));
  (positions || []).forEach((p: any) => countryPositionSheet.addRow({ type: 'Position', name: p.name, code: '', active: p.is_active ? 'Yes' : 'No' }));

  const buffer = await workbook.xlsx.writeBuffer();
  const base64 = Buffer.from(buffer).toString('base64');

  return { success: true, base64 };
}
