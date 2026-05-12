import React, { useState, useEffect } from 'react';
import { Users, Shield, AlertCircle, Clock, TrendingUp, Bell } from 'lucide-react';
import { ApiService } from '../services/api';

const AdminOverview: React.FC<{ user: any }> = ({ user }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await ApiService.getAdminOverview();
        setStats(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    loadStats();
  }, []);

  const metrics = [
    { label: 'Residents', value: stats?.residents, icon: Users, bg: '#DBEAFE', color: '#1D4ED8' },
    { label: 'Guards', value: stats?.guards, icon: Shield, bg: '#D1FAE5', color: '#065F46' },
    { label: 'Helpers', value: stats?.helpers, icon: TrendingUp, bg: '#EDE9FE', color: '#5B21B6' },
    { label: 'Pending', value: stats?.pendingApprovals, icon: Clock, bg: '#FEF3C7', color: '#92400E' },
    { label: 'Open Alerts', value: stats?.openAlerts, icon: AlertCircle, bg: '#FEE2E2', color: '#991B1B' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)', padding: '24px 20px 28px', color: 'white' }}>
        <p style={{ margin: '0 0 4px', opacity: 0.7, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>Admin Panel</p>
        <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 900, letterSpacing: -0.5 }}>Society Overview</h1>
        <p style={{ margin: 0, opacity: 0.7, fontSize: 14 }}>{user?.fullName}</p>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {metrics.map(({ label, value, icon: Icon, bg, color }) => (
            <div key={label} className="sn-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} color={color} />
              </div>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {loading ? '—' : value ?? 0}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Alerts */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Bell size={16} color="var(--brand)" />
            <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>Recent Alerts</p>
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1, 2].map(i => <div key={i} style={{ height: 70, background: 'white', borderRadius: 12, border: '1px solid var(--border)', animation: 'pulse 1.5s infinite' }} />)}
            </div>
          ) : (stats?.recentAlerts?.length > 0) ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.recentAlerts.map((alert: any, i: number) => (
                <div key={i} className="sn-card" style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start', borderLeft: '4px solid var(--danger)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AlertCircle size={18} color="var(--danger)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{alert.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{new Date(alert.createdAt).toLocaleString()}</p>
                      <span style={{ background: alert.severity === 'SOS' ? '#FEE2E2' : '#FEF3C7', color: alert.severity === 'SOS' ? '#991B1B' : '#92400E', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: 16, border: '1px dashed var(--border)' }}>
              <Bell size={32} style={{ opacity: 0.3, marginBottom: 8 }} color="var(--text-muted)" />
              <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>No recent alerts</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
