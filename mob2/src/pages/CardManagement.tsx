import React, { useState, useEffect } from 'react';
import { CreditCard, Ban, Search, ShieldOff } from 'lucide-react';
import { ApiService } from '../services/api';

const CardManagement: React.FC<{ user?: any }> = () => {
  const [helpers, setHelpers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchHelpers(); }, []);

  const fetchHelpers = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getAdminHelpers();
      if (res.data.success) setHelpers(res.data.helpers);
    } catch { console.error('Failed to fetch helpers'); }
    finally { setLoading(false); }
  };

  const handleRevokeCard = async (helperId: number, name: string) => {
    if (!window.confirm(`Revoke card and suspend ${name}?`)) return;
    try {
      await ApiService.revokeCard(helperId);
      fetchHelpers();
    } catch { alert('Failed to revoke card'); }
  };

  const filtered = helpers.filter(h =>
    h.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.qrCardId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)', padding: '24px 20px 24px', color: 'white' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 900 }}>Card Management</h1>
        <p style={{ margin: '0 0 16px', opacity: 0.75, fontSize: 14 }}>Manage staff access cards</p>
        <div style={{ position: 'relative' }}>
          <Search size={16} color="rgba(255,255,255,0.5)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search name or card ID..."
            style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: 12, border: 'none', background: 'rgba(255,255,255,0.1)', fontSize: 14, color: 'white', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16, border: '1px dashed var(--border)' }}>
            <CreditCard size={40} color="var(--text-muted)" style={{ opacity: 0.4, marginBottom: 12 }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>No staff found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((helper) => {
              const isBanned = helper.accountStatus === 'BANNED';
              return (
                <div key={helper.id} className="sn-card" style={{ padding: 16, borderLeft: isBanned ? '4px solid var(--danger)' : '4px solid var(--success)' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
                    <img
                      src={helper.profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(helper.fullName)}&background=F3F4F6&color=374151&bold=true&size=80`}
                      style={{ width: 52, height: 52, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }}
                      alt={helper.fullName}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ margin: '0 0 3px', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>{helper.fullName}</p>
                          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>{helper.phoneNumber}</p>
                        </div>
                        {isBanned
                          ? <span className="sn-badge-danger">Banned</span>
                          : <span className="sn-badge-success">Active</span>
                        }
                      </div>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div style={{ background: 'var(--surface-3)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: helper.qrCardId && !isBanned ? 12 : 0 }}>
                    <CreditCard size={16} color={helper.qrCardId ? '#1D4ED8' : 'var(--text-muted)'} />
                    <div>
                      <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Card ID</p>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: helper.qrCardId ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {helper.qrCardId || 'No Card Assigned'}
                      </p>
                    </div>
                  </div>

                  {helper.qrCardId && !isBanned && (
                    <button
                      onClick={() => handleRevokeCard(helper.id, helper.fullName)}
                      style={{ width: '100%', padding: '12px', borderRadius: 12, background: '#FEE2E2', border: '1.5px solid #FECACA', color: '#DC2626', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                      <Ban size={16} /> Revoke Card & Suspend
                    </button>
                  )}
                  {isBanned && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 12, background: 'var(--surface-3)', color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>
                      <ShieldOff size={16} color="var(--danger)" /> Account Suspended
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardManagement;
