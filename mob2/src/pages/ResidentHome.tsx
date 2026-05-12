import React, { useState, useEffect } from 'react';
import { QrCode, Users as UsersIcon, Trash2, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { ApiService } from '../services/api';


const ResidentHome: React.FC<{ user: any }> = ({ user }) => {
  const [inSociety, setInSociety] = useState([]);
  const [activeApprovals, setActiveApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPreApproveModal, setShowPreApproveModal] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [generatedQR, setGeneratedQR] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [societyRes, approvalsRes] = await Promise.all([
        ApiService.getInSociety(),
        ApiService.getPreApprovals(),
      ]);
      setInSociety(societyRes.data.visitors || []);
      setActiveApprovals(approvalsRes.data.preApprovals || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadActiveApprovals = async () => {
    try {
      const res = await ApiService.getPreApprovals();
      setActiveApprovals(res.data.preApprovals || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadData(); }, []);

  const handlePreApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestPhone) return;
    try {
      const validFrom = new Date();
      const validUntil = new Date(validFrom.getTime() + 24 * 60 * 60 * 1000);
      const res = await ApiService.preApprove({ visitorName: guestName, visitorPhone: guestPhone, validFrom: validFrom.toISOString(), validUntil: validUntil.toISOString() });
      if (res.data.success) setGeneratedQR(res.data.qrCodeValue);
    } catch (err) { alert('Failed to pre-approve guest'); }
  };

  const handleDeleteApproval = async (id: number) => {
    if (!window.confirm('Cancel this pre-approval?')) return;
    try { await ApiService.deletePreApproval(id); loadActiveApprovals(); }
    catch { alert('Failed to cancel'); }
  };

  return (
    <div>
      {/* Hero / Greeting Banner */}
      <div style={{ background: 'linear-gradient(135deg, var(--brand) 0%, #B71C1C 100%)', padding: '24px 20px 32px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ margin: '0 0 4px', opacity: 0.85, fontSize: 14 }}>Welcome back,</p>
            <h2 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 900, letterSpacing: -0.5 }}>{user?.fullName || 'Resident'}</h2>
            {user?.flatNumber && <p style={{ margin: 0, opacity: 0.8, fontSize: 13 }}>Flat {user.flatNumber}</p>}
          </div>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, border: '2px solid rgba(255,255,255,0.4)' }}>
            {user?.fullName?.charAt(0) || 'R'}
          </div>
        </div>
        {/* Stats row */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '10px 14px' }}>
            <p style={{ margin: '0 0 2px', fontSize: 20, fontWeight: 900 }}>{inSociety.length}</p>
            <p style={{ margin: 0, fontSize: 11, opacity: 0.8 }}>Inside Now</p>
          </div>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '10px 14px' }}>
            <p style={{ margin: '0 0 2px', fontSize: 20, fontWeight: 900 }}>{activeApprovals.length}</p>
            <p style={{ margin: 0, fontSize: 11, opacity: 0.8 }}>Active Passes</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <button
            onClick={() => { setShowPreApproveModal(true); setGeneratedQR(''); setGuestName(''); setGuestPhone(''); }}
            className="sn-card"
            style={{ padding: 18, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12, background: 'white', border: '1.5px solid var(--border)' }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QrCode size={22} color="var(--brand)" />
            </div>
            <div>
              <p style={{ margin: '0 0 3px', fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>Pre-Approve Guest</p>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>Generate a temp QR pass</p>
            </div>
          </button>
          <button
            onClick={loadData}
            className="sn-card"
            style={{ padding: 18, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12, background: 'white', border: '1.5px solid var(--border)' }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RefreshCw size={22} color="var(--success)" />
            </div>
            <div>
              <p style={{ margin: '0 0 3px', fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>Refresh</p>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>Update live data</p>
            </div>
          </button>
        </div>

        {/* Active Pre-Approvals */}
        {activeApprovals.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>Active Guest Passes</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activeApprovals.map((approval: any) => (
                <div key={approval.id} className="sn-card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <QrCode size={18} color="var(--brand)" />
                    </div>
                    <div>
                      <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{approval.visitorName}</p>
                      <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={10} /> Expires {new Date(approval.validUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => { setGeneratedQR(approval.qrCodeValue); setShowPreApproveModal(true); }} style={{ padding: '6px 12px', borderRadius: 8, background: '#FEE2E2', border: 'none', color: 'var(--brand)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      View
                    </button>
                    <button onClick={() => handleDeleteApproval(approval.id)} style={{ padding: '6px 10px', borderRadius: 8, background: 'var(--surface-3)', border: 'none', cursor: 'pointer' }}>
                      <Trash2 size={14} color="var(--text-muted)" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Currently Inside */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>Currently Inside</p>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
              <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 8px' }} />
            </div>
          ) : inSociety.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {inSociety.slice(0, 5).map((visitor: any, i) => (
                <div key={i} className="sn-card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: 'var(--text-secondary)', flexShrink: 0 }}>
                    {(visitor.visitorName || '?').charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{visitor.visitorName || 'Unknown'}</p>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle size={11} color="var(--success)" />
                      Flat {visitor.destinationFlat || '-'}
                    </p>
                  </div>
                  <span className="sn-badge-success">Inside</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: 16, border: '1px dashed var(--border)' }}>
              <UsersIcon size={32} color="var(--text-muted)" style={{ opacity: 0.4, marginBottom: 8 }} />
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 14 }}>No visitors inside right now</p>
            </div>
          )}
        </div>
      </div>

      {/* Pre-Approve Modal */}
      {showPreApproveModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: 'white', borderRadius: '24px 24px 0 0', padding: 24, width: '100%', maxWidth: 430, margin: '0 auto', boxShadow: '0 -8px 32px rgba(0,0,0,0.12)' }}>
            <div style={{ width: 40, height: 4, background: 'var(--border)', borderRadius: 4, margin: '0 auto 20px' }} />
            <h3 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>Pre-Approve Guest</h3>

            {generatedQR ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingTop: 8 }}>
                <div style={{ background: 'white', borderRadius: 16, padding: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.1)', border: '1px solid var(--border)' }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${generatedQR}`} alt="QR Code" style={{ width: 200, height: 200, display: 'block' }} />
                </div>
                <div style={{ background: '#DCFCE7', borderRadius: 12, padding: '12px 16px', border: '1px solid #86EFAC', textAlign: 'center' }}>
                  <p style={{ margin: 0, color: '#14532D', fontSize: 14, fontWeight: 600 }}>
                    ✅ Share this QR with your guest. Guard will scan it at the gate.
                  </p>
                </div>
                <button onClick={() => { setShowPreApproveModal(false); loadActiveApprovals(); }} className="sn-btn-outline" style={{ marginTop: 4 }}>
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handlePreApprove} style={{ marginTop: 16 }}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Guest Name</label>
                  <input type="text" required value={guestName} onChange={e => setGuestName(e.target.value)} className="sn-input" placeholder="E.g. Ramesh" />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Phone Number</label>
                  <input type="tel" required value={guestPhone} onChange={e => setGuestPhone(e.target.value)} className="sn-input" placeholder="+91 99999 99999" />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => setShowPreApproveModal(false)} className="sn-btn-outline">Cancel</button>
                  <button type="submit" className="sn-btn-primary">Generate QR</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentHome;
