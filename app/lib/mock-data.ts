// Mock data for Excelente Solutions Recruitment Platform
// All data is static / demo — no backend required.

export type CandidateStatus = 'available' | 'selected' | 'visa' | 'approved';
export type OrderStatus = 'open' | 'closed' | 'pending';

export interface Candidate {
  id: string;
  initials: string;
  name: string;
  nationality: string;
  trade: string;
  country: string;
  status: CandidateStatus;
  agent: string;
  skills: string[];
  passport: boolean;
  medical: boolean;
  cv: boolean;
}

export interface Order {
  id: string;
  employer: string;
  country: string;
  role: string;
  headcount: number;
  filled: number;
  status: OrderStatus;
  salesperson: string;
  deadline: string;
}

export interface Employer {
  id: string;
  initials: string;
  name: string;
  country: string;
  contact: string;
  orders: number;
  placements: number;
  salesperson: string;
}

export interface Document {
  name: string;
  type: string;
  status: 'ok' | 'pending' | 'missing';
  date: string;
}

export const candidates: Candidate[] = [
  {
    id: 'C-001',
    initials: 'AH',
    name: 'Ali Hassan',
    nationality: 'Pakistani',
    trade: 'Welder',
    country: 'Russia',
    status: 'available',
    agent: 'Amir Khan',
    skills: ['MIG', 'TIG', 'Arc'],
    passport: true,
    medical: true,
    cv: true,
  },
  {
    id: 'C-002',
    initials: 'MR',
    name: 'Mirko Radović',
    nationality: 'Serbian',
    trade: 'HGV Driver',
    country: 'Poland',
    status: 'selected',
    agent: 'Petra B.',
    skills: ['HGV', 'CE', 'ADR'],
    passport: true,
    medical: false,
    cv: true,
  },
  {
    id: 'C-003',
    initials: 'GK',
    name: 'Giorgi Kvaratskhelia',
    nationality: 'Georgian',
    trade: 'Chef',
    country: 'Greece',
    status: 'visa',
    agent: 'Nikos P.',
    skills: ['Mediterranean', 'Pastry'],
    passport: true,
    medical: true,
    cv: true,
  },
  {
    id: 'C-004',
    initials: 'IM',
    name: 'Ion Moldovan',
    nationality: 'Romanian',
    trade: 'Electrician',
    country: 'Romania',
    status: 'approved',
    agent: 'Elena V.',
    skills: ['LV', 'MV', 'Solar'],
    passport: true,
    medical: true,
    cv: true,
  },
  {
    id: 'C-005',
    initials: 'SB',
    name: 'Suleiman Baig',
    nationality: 'Pakistani',
    trade: 'Crane Operator',
    country: 'Russia',
    status: 'available',
    agent: 'Amir Khan',
    skills: ['Tower Crane', 'Mobile Crane'],
    passport: true,
    medical: true,
    cv: false,
  },
  {
    id: 'C-006',
    initials: 'VP',
    name: 'Vasile Petrescu',
    nationality: 'Romanian',
    trade: 'Plumber',
    country: 'Poland',
    status: 'available',
    agent: 'Elena V.',
    skills: ['Heating', 'Sanitary'],
    passport: false,
    medical: false,
    cv: true,
  },
];

export const orders: Order[] = [
  {
    id: 'ORD-001',
    employer: 'Petrov Construction LLC',
    country: 'Russia',
    role: 'Welder',
    headcount: 12,
    filled: 8,
    status: 'open',
    salesperson: 'Elena Koval',
    deadline: '2026-08-15',
  },
  {
    id: 'ORD-002',
    employer: 'Trans-Pol Logistics',
    country: 'Poland',
    role: 'HGV Driver',
    headcount: 6,
    filled: 6,
    status: 'closed',
    salesperson: 'Marek Wiśniewski',
    deadline: '2026-07-01',
  },
  {
    id: 'ORD-003',
    employer: 'Aegean Hotels Group',
    country: 'Greece',
    role: 'Chef',
    headcount: 4,
    filled: 1,
    status: 'open',
    salesperson: 'Nikos Stavros',
    deadline: '2026-09-01',
  },
  {
    id: 'ORD-004',
    employer: 'RomConstruct SRL',
    country: 'Romania',
    role: 'Electrician',
    headcount: 8,
    filled: 3,
    status: 'pending',
    salesperson: 'Ioana M.',
    deadline: '2026-10-01',
  },
];

export const employers: Employer[] = [
  {
    id: 'E-001',
    initials: 'PC',
    name: 'Petrov Construction LLC',
    country: 'Russia',
    contact: 'Sergei Petrov',
    orders: 3,
    placements: 24,
    salesperson: 'Elena Koval',
  },
  {
    id: 'E-002',
    initials: 'TP',
    name: 'Trans-Pol Logistics',
    country: 'Poland',
    contact: 'Piotr Malinowski',
    orders: 2,
    placements: 12,
    salesperson: 'Marek Wiśniewski',
  },
  {
    id: 'E-003',
    initials: 'AH',
    name: 'Aegean Hotels Group',
    country: 'Greece',
    contact: 'Eleni Papadakis',
    orders: 2,
    placements: 8,
    salesperson: 'Nikos Stavros',
  },
  {
    id: 'E-004',
    initials: 'RC',
    name: 'RomConstruct SRL',
    country: 'Romania',
    contact: 'Andrei Ionescu',
    orders: 1,
    placements: 6,
    salesperson: 'Ioana M.',
  },
];

export const documents: Document[] = [
  { name: 'Passport', type: 'PDF', status: 'ok', date: '2026-01-15' },
  { name: 'Medical Certificate', type: 'PDF', status: 'ok', date: '2026-03-20' },
  { name: 'CV / Résumé', type: 'PDF', status: 'ok', date: '2025-11-04' },
  { name: 'Trade Certificate', type: 'PDF', status: 'pending', date: '—' },
  { name: 'Visa Application', type: 'PDF', status: 'missing', date: '—' },
];

export const roleConfig = {
  admin: {
    label: 'Admin Console',
    user: 'Sofia Romano',
    initials: 'SR',
    role: 'Administrator',
  },
  salesperson: {
    label: 'Sales Portal',
    user: 'Elena Koval',
    initials: 'EK',
    role: 'Salesperson',
  },
  agent: {
    label: 'Agent Portal',
    user: 'Amir Khan',
    initials: 'AK',
    role: 'Field Agent',
  },
  employer: {
    label: 'Employer Portal',
    user: 'Sergei Petrov',
    initials: 'SP',
    role: 'Employer',
  },
  lawyer: {
    label: 'Legal Portal',
    user: 'Maria Costa',
    initials: 'MC',
    role: 'Lawyer',
  },
} as const;

export type Role = keyof typeof roleConfig;
