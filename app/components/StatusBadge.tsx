import type { CandidateStatus, OrderStatus } from '../lib/mock-data';

type StatusType = CandidateStatus | OrderStatus;

const statusMap: Record<StatusType, { cls: string; label: string }> = {
  available: { cls: 't-avail', label: 'Available' },
  selected: { cls: 't-select', label: 'Selected' },
  visa: { cls: 't-visa', label: 'Visa Processing' },
  approved: { cls: 't-approve', label: 'Approved' },
  open: { cls: 't-open', label: 'Open' },
  closed: { cls: 't-closed', label: 'Closed' },
  pending: { cls: 't-pending', label: 'Pending' },
};

export default function StatusBadge({ status }: { status: StatusType }) {
  const { cls, label } = statusMap[status] ?? { cls: 't-pending', label: status };
  return <span className={`tag ${cls}`}>{label}</span>;
}
