import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle, MessageSquare } from 'lucide-react';
import { ApiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const OtpPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { phoneNumber, otp: passedOtp } = location.state || { phoneNumber: '' };

  const DEMO_NUMBERS = ['+919876543211', '+919876543212', '+919876543213', '+919876543214', '+919876543215', '+919876543210'];
  const devOtp = passedOtp || (DEMO_NUMBERS.includes(phoneNumber) ? '123456' : null);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const verifyingRef = useRef(false);

  // Auto-prefill OTP and trigger verify when devOtp is available
  useEffect(() => {
    if (!phoneNumber) { navigate('/login'); return; }
    
    const timer = setInterval(() => setCountdown((p) => (p > 0 ? p - 1 : 0)), 1000);

    if (devOtp) {
      const digits = devOtp.toString().split('').slice(0, 6);
      const filled = [...digits, ...Array(6 - digits.length).fill('')];
      setOtp(filled);
      
      // Auto-submit after a short delay so the user can see the pre-fill
      const autoSubmit = setTimeout(() => {
        if (!verifyingRef.current) {
          handleVerify(devOtp.toString());
        }
      }, 600);
      return () => { clearInterval(timer); clearTimeout(autoSubmit); };
    } else {
      inputRefs.current[0]?.focus();
    }

    return () => clearInterval(timer);
  }, [phoneNumber, navigate, devOtp]);

  const handleChange = (index: number, value: string) => {
    // Handle paste or auto-complete
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      if (!pasted) return;
      const newOtp = [...otp];
      for (let i = 0; i < pasted.length; i++) {
        if (index + i < 6) newOtp[index + i] = pasted[i];
      }
      setOtp(newOtp);
      const nextFocus = Math.min(index + pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();
      if (newOtp.every(d => d !== '')) handleVerify(newOtp.join(''));
      return;
    }

    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    if (newOtp.every(d => d !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    if (pasted.length === 6) handleVerify(pasted);
  };

  const handleVerify = async (otpString: string) => {
    if (verifyingRef.current || loading) return;
    verifyingRef.current = true;
    setLoading(true); 
    setError('');
    
    try {
      const response = await ApiService.verifyOtp(phoneNumber, otpString);
      if (response.data.success) { 
        login(response.data.token, response.data.user); 
        navigate('/'); 
      } else { 
        setError(response.data.message || 'Invalid OTP'); 
        setOtp(['', '', '', '', '', '']); 
        inputRefs.current[0]?.focus(); 
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed');
      setOtp(['', '', '', '', '', '']); 
      inputRefs.current[0]?.focus();
    } finally { 
      setLoading(false); 
      verifyingRef.current = false;
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    try { 
      await ApiService.sendOtp(phoneNumber); 
      setCountdown(30); 
      setOtp(['', '', '', '', '', '']); 
      inputRefs.current[0]?.focus(); 
      setError('');
    } catch { 
      setError('Failed to resend OTP'); 
    }
  };

  return (
    <div className="page-scroll" style={{ background: 'linear-gradient(160deg, #fff 0%, #FFF5F5 100%)', minHeight: '100vh', padding: '16px 24px 40px' }}>
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 12, background: 'white', border: '1.5px solid var(--border)', cursor: 'pointer', marginBottom: 32, boxShadow: 'var(--shadow-sm)' }}>
        <ChevronLeft size={20} color="var(--text-primary)" />
      </button>

      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 20, background: '#FEE2E2', marginBottom: 20 }}>
          <MessageSquare size={28} color="var(--brand)" />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 8px' }}>Verify your number</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, margin: 0 }}>
          We sent a 6-digit code to <strong style={{ color: 'var(--text-primary)' }}>{phoneNumber}</strong>
        </p>
      </div>

      {/* OTP Boxes */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 28, justifyContent: 'space-between' }}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="tel"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            style={{
              width: '100%',
              minWidth: 0,
              aspectRatio: '0.8',
              maxHeight: 64,
              background: digit ? 'white' : 'var(--surface-3)',
              border: `2px solid ${digit ? 'var(--brand)' : 'var(--border)'}`,
              borderRadius: 12, textAlign: 'center', fontSize: 24, fontWeight: 800,
              color: 'var(--text-primary)', outline: 'none', transition: 'all 0.15s',
              boxShadow: digit ? '0 4px 14px rgba(229,57,53,0.15)' : 'none',
              padding: 0
            }}
          />
        ))}
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: '#FEE2E2', borderRadius: 12, border: '1px solid #FECACA', color: 'var(--danger)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)' }} />
          {error}
        </div>
      )}

      <button onClick={() => handleVerify(otp.join(''))} disabled={loading || otp.some(d => d === '')} className="sn-btn-primary" style={{ marginBottom: 20 }}>
        {loading
          ? <div style={{ width: 24, height: 24, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          : <><CheckCircle size={20} /> Verify & Continue</>
        }
      </button>

      <div style={{ textAlign: 'center' }}>
        {countdown > 0
          ? <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Resend OTP in <strong>{countdown}s</strong></p>
          : <button onClick={handleResend} style={{ background: 'none', border: 'none', color: 'var(--brand)', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Resend OTP</button>
        }
      </div>
    </div>
  );
};

export default OtpPage;
