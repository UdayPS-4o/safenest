import React, { useEffect, useState } from 'react';
import { MapPin, CheckCircle, RefreshCw, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as QRCode from 'qrcode';

const PLATFORM_COLORS: Record<string, { color: string; emoji: string }> = {
  swiggy:   { color: '#FF5200', emoji: '🍊' },
  zomato:   { color: '#E23744', emoji: '🍕' },
  amazon:   { color: '#FF9900', emoji: '📦' },
  flipkart: { color: '#2874F0', emoji: '🛒' },
  blinkit:  { color: '#FDD835', emoji: '⚡' },
};

// Mocked delivery assignment — real API will replace this later
const MOCK_DELIVERY = {
  residentName: 'Arjun Sharma',
  residentFlat: 'Tower 4 – Flat B201',
  society: 'Whitefield Society',
  orderInfo: 'Food order #SW-482910',
  estimatedArrival: '1:55 PM',
};

const DeliveryHome: React.FC<{ user: any }> = ({ user }) => {
  const { logout } = useAuth();
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // QR value = DEL:<userId>  (guard scans this to look up the partner)
  const qrValue = `DEL:${user?.id}`;

  // Detect platform from partnerId prefix (e.g. "SWG-…" → swiggy)
  const partnerIdLower = (user?.partnerId || '').toLowerCase();
  const platformKey = Object.keys(PLATFORM_COLORS).find(k => partnerIdLower.startsWith(k.slice(0, 3)));
  const platform = PLATFORM_COLORS[platformKey || ''] || { color: '#6B7280', emoji: '🚚' };

  useEffect(() => {
    QRCode.toDataURL(qrValue, {
      width: 280,
      margin: 2,
      color: { dark: '#0A0A0F', light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
    }).then(setQrDataUrl);
  }, [qrValue, refreshKey]);

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{
      minHeight: '100%',
      background: 'linear-gradient(160deg, #0A0A0F 0%, #0f0a00 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '24px 20px 40px',
      overflowY: 'auto',
    }}>

      {/* Header row */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1 }}>
            Entry Pass
          </p>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: 'white' }}>
            {user?.fullName || 'Delivery Partner'}
          </h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: 'white', fontVariantNumeric: 'tabular-nums' }}>{timeStr}</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(74,222,128,0.12)', borderRadius: 100, padding: '3px 8px', marginTop: 2 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 6px #4ADE80' }} />
            <span style={{ fontSize: 11, color: '#4ADE80', fontWeight: 700 }}>Active</span>
          </div>
        </div>
      </div>

      {/* Partner badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 18, padding: '12px 18px', marginBottom: 24, width: '100%',
      }}>
        <div style={{
          width: 46, height: 46, borderRadius: 13,
          background: platform.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, flexShrink: 0,
        }}>
          {platform.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 800, color: 'white', fontSize: 15 }}>{user?.fullName || 'Partner'}</p>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
            {user?.partnerId ? `ID: ${user.partnerId}` : 'Delivery Partner'}
          </p>
        </div>
        <CheckCircle size={20} color="#4ADE80" />
      </div>

      {/* QR Code card */}
      <div style={{
        background: 'white', borderRadius: 24, padding: 20,
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        marginBottom: 24, position: 'relative',
      }}>
        {qrDataUrl
          ? <img src={qrDataUrl} alt="Identity QR" style={{ width: 280, height: 280, display: 'block' }} />
          : <div style={{ width: 280, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 32, height: 32, border: '3px solid #f0f0f0', borderTopColor: '#E57373', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            </div>
        }
      </div>

      {/* Instruction */}
      <div style={{
        width: '100%',
        background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)',
        borderRadius: 14, padding: '11px 16px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 20 }}>📱</span>
        <div>
          <p style={{ margin: 0, color: '#4ADE80', fontSize: 13, fontWeight: 700 }}>Show this to the security guard</p>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>They will scan to verify your identity</p>
        </div>
      </div>

      {/* Current delivery info (mocked) */}
      <div style={{
        width: '100%',
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 18, padding: '16px 18px', marginBottom: 20,
      }}>
        <p style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1 }}>
          Current Delivery
        </p>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
          <MapPin size={15} color="#E57373" style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <p style={{ margin: 0, fontWeight: 800, color: 'white', fontSize: 15 }}>{MOCK_DELIVERY.residentName}</p>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{MOCK_DELIVERY.residentFlat}</p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{MOCK_DELIVERY.society}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Truck size={15} color="#FBBF24" style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{MOCK_DELIVERY.orderInfo}</p>
        </div>

        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '8px 12px' }}>
            <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase' }}>Order Placed</p>
            <p style={{ margin: '2px 0 0', fontSize: 14, color: 'white', fontWeight: 800 }}>1:35 PM</p>
          </div>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '8px 12px' }}>
            <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase' }}>Est. Arrival</p>
            <p style={{ margin: '2px 0 0', fontSize: 14, color: '#FBBF24', fontWeight: 800 }}>{MOCK_DELIVERY.estimatedArrival}</p>
          </div>
        </div>
      </div>

      {/* Refresh + Logout */}
      <div style={{ width: '100%', display: 'flex', gap: 10 }}>
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          style={{
            flex: 1, padding: '13px', borderRadius: 14,
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
            color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          }}
        >
          <RefreshCw size={15} /> Refresh QR
        </button>
        <button
          onClick={logout}
          style={{
            flex: 1, padding: '13px', borderRadius: 14,
            background: 'rgba(229,57,53,0.12)', border: '1px solid rgba(229,57,53,0.25)',
            color: '#FCA5A5', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default DeliveryHome;
