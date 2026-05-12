import React, { useState } from 'react';
import { Users, Home, UserPlus, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Household: React.FC<{ user?: any }> = () => {
  const { user } = useAuth();
  const [members] = useState<any[]>([
    { id: user?.id, fullName: user?.fullName, phoneNumber: user?.phoneNumber, isPrimary: true, accountStatus: 'APPROVED' },
    { id: 999, fullName: 'Priya Sharma', phoneNumber: '+91 98765 43299', isPrimary: false, accountStatus: 'APPROVED' },
  ]);

  return (
    <div>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #2D1B69 100%)', padding: '24px 20px 40px', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <Home size={120} color="rgba(255,255,255,0.04)" style={{ position: 'absolute', right: -20, top: -10 }} />
        <p style={{ margin: '0 0 4px', opacity: 0.7, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>My Household</p>
        <h1 style={{ margin: '0 0 20px', fontSize: 28, fontWeight: 900, letterSpacing: -0.5 }}>Flat {user?.flatNumber || 'Unknown'}</h1>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield size={18} color="rgba(255,255,255,0.7)" />
            <div>
              <p style={{ margin: 0, fontSize: 11, opacity: 0.7 }}>Society ID</p>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>{user?.societyId || '1'}</p>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={18} color="rgba(255,255,255,0.7)" />
            <div>
              <p style={{ margin: 0, fontSize: 11, opacity: 0.7 }}>Members</p>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>{members.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>Members</p>
          <button
            onClick={() => alert('Adding new household members will be available soon.')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--brand)', background: '#FEE2E2', border: 'none', borderRadius: 10, padding: '7px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            <UserPlus size={15} /> Add Member
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {members.map((member) => (
            <div key={member.id} className="sn-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                background: member.isPrimary ? '#FEE2E2' : 'var(--surface-3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 900,
                color: member.isPrimary ? 'var(--brand)' : 'var(--text-secondary)',
                border: member.isPrimary ? '2px solid #FECACA' : '2px solid var(--border)'
              }}>
                {member.fullName?.charAt(0) || '?'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>{member.fullName}</p>
                  {member.isPrimary && (
                    <span style={{ background: '#FEE2E2', color: 'var(--brand)', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Primary</span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>{member.phoneNumber}</p>
              </div>
              <span className={member.accountStatus === 'APPROVED' ? 'sn-badge-success' : 'sn-badge-warning'}>
                {member.accountStatus === 'APPROVED' ? 'Active' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Household;
