import React, { useState, useEffect } from 'react';
import { UserCheck, UserX } from 'lucide-react';
import { ApiService } from '../services/api';

const UserManagement: React.FC<{ user?: any }> = () => {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPendingUsers(); }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getPendingUsers();
      if (res.data.success) setPendingUsers(res.data.users);
    } catch { console.error('Failed to fetch pending users'); }
    finally { setLoading(false); }
  };

  const handleAction = async (userId: number, action: 'approve' | 'ban') => {
    try {
      action === 'approve' ? await ApiService.approveUser(userId) : await ApiService.banUser(userId);
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
    } catch { alert(`Failed to ${action} user`); }
  };

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)', padding: '24px 20px 28px', color: 'white' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 900 }}>User Management</h1>
        <p style={{ margin: 0, opacity: 0.75, fontSize: 14 }}>{pendingUsers.length} pending approval{pendingUsers.length !== 1 ? 's' : ''}</p>
      </div>

      <div style={{ padding: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
          </div>
        ) : pendingUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16, border: '1px dashed var(--border)' }}>
            <UserCheck size={40} color="var(--success)" style={{ opacity: 0.5, marginBottom: 12 }} />
            <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', margin: '0 0 4px' }}>All Caught Up!</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>No pending approvals.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingUsers.map((user) => (
              <div key={user.id} className="sn-card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'var(--text-secondary)', flexShrink: 0 }}>
                    {user.fullName?.charAt(0) || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ margin: '0 0 3px', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>{user.fullName || 'Unknown'}</p>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>{user.phoneNumber}</p>
                      </div>
                      <span className="sn-badge-warning">Pending</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: 'var(--surface-3)', borderRadius: 10, padding: '10px 12px', marginBottom: 14 }}>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Requested Role</p>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{user.role}</p>
                  </div>
                  {user.flatNumber && (
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Flat</p>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{user.flatNumber}</p>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => handleAction(user.id, 'approve')}
                    style={{ flex: 1, padding: '12px', borderRadius: 12, background: '#DCFCE7', border: '1.5px solid #86EFAC', color: '#15803D', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <UserCheck size={16} /> Approve
                  </button>
                  <button
                    onClick={() => handleAction(user.id, 'ban')}
                    style={{ flex: 1, padding: '12px', borderRadius: 12, background: '#FEE2E2', border: '1.5px solid #FECACA', color: '#DC2626', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <UserX size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
