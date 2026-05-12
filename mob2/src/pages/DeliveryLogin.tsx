import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ChevronLeft, Truck, User, MapPin, Hash, ArrowRight, CheckCircle, RefreshCw } from 'lucide-react';
import { ApiService } from '../services/api';
import * as QRCode from 'qrcode';

type Step = 'form' | 'qr';

const PLATFORMS = [
  { id: 'swiggy',   label: 'Swiggy',        color: '#FF5200', emoji: '🍊' },
  { id: 'zomato',   label: 'Zomato',         color: '#E23744', emoji: '🍕' },
  { id: 'amazon',   label: 'Amazon',         color: '#FF9900', emoji: '📦' },
  { id: 'flipkart', label: 'Flipkart',       color: '#2874F0', emoji: '🛒' },
  { id: 'blinkit',  label: 'Blinkit',        color: '#FDD835', emoji: '⚡' },
  { id: 'other',    label: 'Other',          color: '#6B7280', emoji: '🚚' },
];

const DeliveryLogin: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('form');

  // Form state
  const [fullName, setFullName] = useState('');
  const [partnerId, setPartnerId] = useState('');
  const [platform, setPlatform] = useState('');
  const [residentFlat, setResidentFlat] = useState('');
  const [residentName, setResidentName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // QR state
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrToken, setQrToken] = useState('');
  const [partnerInfo, setPartnerInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedPlatform = PLATFORMS.find(p => p.id === platform);

  const handleGenerateQr = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fullName.trim()) { setError('Enter your full name'); return; }
    if (!partnerId.trim()) { setError('Enter your partner/employee ID'); return; }
    if (!platform) { setError('Select your delivery platform'); return; }
    if (!residentFlat.trim()) { setError('Enter the flat/door number you are delivering to'); return; }

    setLoading(true);
    setError('');

    try {
      const res = await ApiService.deliveryLogin({
        fullName: fullName.trim(),
        partnerId: partnerId.trim(),
        platform: selectedPlatform?.label || platform,
        deliveryAddress: deliveryAddress.trim(),
        residentFlat: residentFlat.trim(),
        residentName: residentName.trim(),
      });

      if (res.data.success) {
        const token = res.data.qrToken;
        setQrToken(token);
        setPartnerInfo(res.data.partner);

        // Generate QR image from the JWT token
        const dataUrl = await QRCode.toDataURL(token, {
          width: 280,
          margin: 2,
          color: { dark: '#0A0A0F', light: '#FFFFFF' },
          errorCorrectionLevel: 'M',
        });
        setQrDataUrl(dataUrl);
        setStep('qr');
      } else {
        setError(res.data.message || 'Failed to generate QR');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Network error. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('form');
    setQrDataUrl('');
    setQrToken('');
    setPartnerInfo(null);
    setError('');
  };

  /* ─── QR Screen ─────────────────────────────────────────── */
  if (step === 'qr') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0A0A0F 0%, #1a0f00 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '0 20px 40px',
      }}>
        {/* Header */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', paddingTop: 56, marginBottom: 28 }}>
          <button
            onClick={handleReset}
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: 10, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center' }}
          >
            <ChevronLeft size={20} />
          </button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h2 style={{ color: 'white', fontSize: 18, fontWeight: 800, margin: 0 }}>Your Entry QR Code</h2>
          </div>
          <div style={{ width: 40 }} />
        </div>

        {/* Partner Badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 16, padding: '12px 18px', marginBottom: 24, width: '100%', maxWidth: 360,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: selectedPlatform?.color || '#6B7280',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, flexShrink: 0,
          }}>
            {selectedPlatform?.emoji || '🚚'}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 800, color: 'white', fontSize: 15 }}>{partnerInfo?.fullName}</p>
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              Verified {partnerInfo?.platform} Partner
            </p>
          </div>
          <CheckCircle size={20} color="#4ADE80" style={{ marginLeft: 'auto', flexShrink: 0 }} />
        </div>

        {/* QR Code */}
        <div style={{
          background: 'white', borderRadius: 24, padding: 20,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          marginBottom: 24,
        }}>
          {qrDataUrl && (
            <img src={qrDataUrl} alt="Delivery QR Code" style={{ width: 280, height: 280, display: 'block' }} />
          )}
        </div>

        {/* Delivery Info */}
        <div style={{
          width: '100%', maxWidth: 360,
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 18, padding: '16px 18px', marginBottom: 16,
        }}>
          <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>
            Delivering To
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <MapPin size={16} color="#E57373" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              {partnerInfo?.residentName && (
                <p style={{ margin: '0 0 2px', fontWeight: 700, color: 'white', fontSize: 14 }}>{partnerInfo.residentName}</p>
              )}
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600 }}>
                Flat {partnerInfo?.residentFlat}
              </p>
              {deliveryAddress && (
                <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{deliveryAddress}</p>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          width: '100%', maxWidth: 360,
          background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)',
          borderRadius: 14, padding: '12px 16px', marginBottom: 24,
        }}>
          <p style={{ margin: 0, color: '#4ADE80', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
            📱 Show this QR code to the security guard at the gate
          </p>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: 11, textAlign: 'center' }}>
            Valid for 2 hours from generation
          </p>
        </div>

        <button
          onClick={handleReset}
          style={{
            width: '100%', maxWidth: 360, padding: 14, borderRadius: 14,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <RefreshCw size={16} /> Generate New QR
        </button>
      </div>
    );
  }

  /* ─── Form Screen ────────────────────────────────────────── */
  return (
    <div className="page-scroll" style={{ background: 'linear-gradient(160deg, #0A0A0F 0%, #1a0f00 100%)', minHeight: '100vh' }}>
      <div style={{ padding: '0 22px 48px' }}>
        {/* Header */}
        <div style={{ paddingTop: 56, paddingBottom: 32 }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10, padding: '8px 14px', cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
              fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24,
            }}
          >
            <ChevronLeft size={16} /> Back
          </button>

          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, borderRadius: 22, marginBottom: 18,
            background: 'linear-gradient(135deg, #FF9900, #E57373)',
            boxShadow: '0 8px 30px rgba(255,153,0,0.3)',
          }}>
            <Package size={36} color="white" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'white', margin: '0 0 6px', letterSpacing: -0.5 }}>
            Delivery Partner
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: 0 }}>
            Generate a QR code for gate entry
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleGenerateQr}>
          {/* Platform selection */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              Delivery Platform
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {PLATFORMS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlatform(p.id)}
                  style={{
                    padding: '10px 8px', borderRadius: 12, cursor: 'pointer',
                    border: `2px solid ${platform === p.id ? p.color : 'rgba(255,255,255,0.1)'}`,
                    background: platform === p.id ? `${p.color}22` : 'rgba(255,255,255,0.04)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 20 }}>{p.emoji}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: platform === p.id ? p.color : 'rgba(255,255,255,0.5)' }}>
                    {p.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Name field */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Your Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Rahul Kumar"
                style={{
                  width: '100%', padding: '14px 14px 14px 42px',
                  borderRadius: 13, border: '1.5px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.06)', color: 'white',
                  fontSize: 15, fontWeight: 600, outline: 'none', fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Partner ID */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Employee / Partner ID
            </label>
            <div style={{ position: 'relative' }}>
              <Hash size={16} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                value={partnerId}
                onChange={e => setPartnerId(e.target.value)}
                placeholder="SWG-4829301"
                style={{
                  width: '100%', padding: '14px 14px 14px 42px',
                  borderRadius: 13, border: '1.5px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.06)', color: 'white',
                  fontSize: 15, fontWeight: 600, outline: 'none', fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Resident Flat */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Delivering To (Flat / Door No.)
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                value={residentFlat}
                onChange={e => setResidentFlat(e.target.value)}
                placeholder="B-201 / Tower 4 Flat 12"
                style={{
                  width: '100%', padding: '14px 14px 14px 42px',
                  borderRadius: 13, border: '1.5px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.06)', color: 'white',
                  fontSize: 15, fontWeight: 600, outline: 'none', fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Resident Name (optional) */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Resident Name <span style={{ opacity: 0.5, fontWeight: 400, textTransform: 'none' }}>(optional)</span>
            </label>
            <input
              value={residentName}
              onChange={e => setResidentName(e.target.value)}
              placeholder="Arjun Sharma"
              style={{
                width: '100%', padding: '14px',
                borderRadius: 13, border: '1.5px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.06)', color: 'white',
                fontSize: 15, fontWeight: 600, outline: 'none', fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Package/Delivery info (optional) */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Order / Package Info <span style={{ opacity: 0.5, fontWeight: 400, textTransform: 'none' }}>(optional)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Truck size={16} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
                placeholder="Food order #482910"
                style={{
                  width: '100%', padding: '14px 14px 14px 42px',
                  borderRadius: 13, border: '1.5px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.06)', color: 'white',
                  fontSize: 15, fontWeight: 600, outline: 'none', fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(252,165,165,0.3)', borderRadius: 12, padding: '10px 14px', marginBottom: 16 }}>
              <p style={{ color: '#FCA5A5', fontSize: 13, margin: 0, fontWeight: 600 }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '16px', borderRadius: 14,
              background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #FF9900, #E57373)',
              border: 'none', color: 'white', fontSize: 16, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: loading ? 'none' : '0 4px 24px rgba(255,153,0,0.35)',
              transition: 'all 0.2s',
            }}
          >
            {loading ? (
              <div style={{ width: 24, height: 24, border: '3px solid rgba(255,255,255,0.2)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            ) : (
              <><Package size={20} /> Generate Entry QR <ArrowRight size={18} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DeliveryLogin;
