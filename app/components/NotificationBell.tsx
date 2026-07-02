'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { markNotificationRead, markAllNotificationsRead } from '@/app/dashboard/notifications-actions';

interface NotificationItem {
  id: string;
  title: string;
  body: string | null;
  created_at: string;
  read_at: string | null;
}

export default function NotificationBell({ notifications, unreadCount }: { notifications: NotificationItem[]; unreadCount: number }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkOne = async (id: string) => {
    await markNotificationRead(id);
    router.refresh();
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    router.refresh();
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="bell" aria-label="Notifications" onClick={() => setOpen(o => !o)}>
        🔔{unreadCount > 0 && <span className="dot" />}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 10px)',
            width: '340px',
            maxHeight: '420px',
            overflowY: 'auto',
            background: '#fff',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
            zIndex: 50,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
            <span style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--ink)' }}>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAll} style={{ background: 'none', border: 'none', color: 'var(--brand)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
              No notifications yet.
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => !n.read_at && handleMarkOne(n.id)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--line)',
                  background: n.read_at ? '#fff' : 'var(--paper, #f9f8f6)',
                  cursor: n.read_at ? 'default' : 'pointer',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)', marginBottom: '3px' }}>{n.title}</div>
                {n.body && <div style={{ fontSize: '12.5px', color: 'var(--slate)', marginBottom: '4px' }}>{n.body}</div>}
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
