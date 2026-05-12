import React, { useState, useEffect } from 'react';
import { LogOut, Clock, CheckCircle, Users } from 'lucide-react';
import { ApiService } from '../services/api';

const GuardLog: React.FC<{ user?: any }> = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    try {
      const res = await ApiService.getInSociety();
      if (res.data.success) setLogs(res.data.visitors);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleMarkExit = async (logId: number) => {
    try {
      await ApiService.logExit(logId);
      fetchLogs();
    } catch { alert('Failed to log exit'); }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'var(--brand)', padding: '24px 20px 28px', color: 'white' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 900 }}>Activity Log</h1>
        <p style={{ margin: 0, opacity: 0.85, fontSize: 14 }}>{logs.length} visitor{logs.length !== 1 ? 's' : ''} currently inside</p>
      </div>

      <div style={{ padding: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
            Loading...
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16, border: '1px dashed var(--border)' }}>
            <CheckCircle size={40} color="var(--success)" style={{ marginBottom: 12, opacity: 0.6 }} />
            <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', margin: '0 0 4px' }}>All Clear</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>No active visitors inside</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {logs.map((log: any) => (
              <div key={log.logId} className="sn-card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: 'var(--brand)', flexShrink: 0 }}>
                    {(log.visitorName || '?').charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ margin: '0 0 3px', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>{log.visitorName || 'Unknown'}</p>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>{log.visitorPhone}</p>
                      </div>
                      <span className="sn-badge-warning" style={{ flexShrink: 0 }}>Inside</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, background: 'var(--surface-3)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                    <Users size={14} color="var(--text-muted)" />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Flat <strong style={{ color: 'var(--text-primary)' }}>{log.destinationFlat}</strong></span>
                  </div>
                  <div style={{ width: 1, background: 'var(--border)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={14} color="var(--text-muted)" />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {new Date(log.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleMarkExit(log.logId)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '12px', borderRadius: 12, background: 'white', border: '1.5px solid var(--border)',
                    color: 'var(--text-primary)', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s'
                  }}
                >
                  <LogOut size={16} color="var(--brand)" />
                  Mark Exit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuardLog;
