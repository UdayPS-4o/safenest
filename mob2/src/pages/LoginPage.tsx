import React, { useState } from 'react';
import { Shield, ArrowRight, Phone } from 'lucide-react';
import { ApiService } from '../services/api';

const LoginPage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const phone = phoneNumber.trim();
    if (phone.length < 10) { setError('Enter a valid 10-digit number'); return; }
    setLoading(true); setError('');
    const formatted = phone.startsWith('+') ? phone : `+91${phone}`;
    try {
      const response = await ApiService.sendOtp(formatted);
      if (response.data.success) {
        navigate('/otp', { state: { phoneNumber: formatted, otp: response.data.otp } });
      } else { setError(response.data.message || 'Failed to send OTP'); }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Network error. Check connection.');
    } finally { setLoading(false); }
  };

  const quickLogin = (num: string) => { setPhoneNumber(num); };

  return (
    <div className="page-scroll" style={{ background: 'linear-gradient(160deg, #fff 0%, #FFF5F5 100%)', minHeight: '100vh' }}>
      <div style={{ padding: '0 24px 40px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', paddingTop: 72, paddingBottom: 48 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 96, height: 96, borderRadius: 28, marginBottom: 24,
            background: 'var(--brand)',
            boxShadow: '0 8px 30px rgba(229,57,53,0.35)'
          }}>
            <Shield size={48} color="white" />
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: -1 }}>SafeNest</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, margin: 0 }}>Smart Society Security Platform</p>
        </div>

        {/* Login Card */}
        <div className="sn-card animate-entry" style={{ padding: 24, marginBottom: 16 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, color: 'var(--text-primary)' }}>Enter your mobile number</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20, margin: '0 0 20px' }}>
            We'll send a one-time verification code
          </p>

          <form onSubmit={handleSendOtp}>
            <div style={{
              display: 'flex', background: 'var(--surface-3)', borderRadius: 14,
              border: '1.5px solid var(--border)', overflow: 'hidden', marginBottom: 12
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px',
                borderRight: '1.5px solid var(--border)', color: 'var(--text-secondary)',
                fontWeight: 700, fontSize: 16, background: 'white', whiteSpace: 'nowrap'
              }}>
                <Phone size={16} color="var(--brand)" />
                +91
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210"
                style={{
                  flex: 1, padding: '16px', background: 'transparent', border: 'none',
                  outline: 'none', fontSize: 20, fontWeight: 700, letterSpacing: 2,
                  color: 'var(--text-primary)', fontFamily: 'inherit'
                }}
                disabled={loading}
              />
            </div>

            {error && (
              <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12, padding: '8px 12px', background: '#FEE2E2', borderRadius: 8 }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="sn-btn-primary">
              {loading ? (
                <div style={{ width: 24, height: 24, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              ) : (<>Get OTP <ArrowRight size={20} /></>)}
            </button>
          </form>
        </div>

        {/* Quick Login */}
        <div className="sn-card animate-entry-delay" style={{ padding: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Quick Login (Demo)
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: '🏠 Resident', num: '9876543211' },
              { label: '🛡️ Guard',    num: '9876543212' },
              { label: '🔧 Helper',   num: '9876543213' },
              { label: '⚙️ Admin',    num: '9876543214' },
              { label: '🚚 Delivery', num: '9876543215' },
            ].map(({ label, num }) => (
              <button
                key={num}
                onClick={() => quickLogin(num)}
                style={{
                  padding: '10px 12px', borderRadius: 10, background: phoneNumber === num ? '#FEE2E2' : 'var(--surface-3)',
                  border: `1.5px solid ${phoneNumber === num ? 'var(--brand)' : 'var(--border)'}`,
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s'
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{label}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{num}</p>
              </button>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12, textAlign: 'center' }}>
            OTP: <strong>123456</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
