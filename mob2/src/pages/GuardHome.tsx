import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ShieldAlert, X, CheckCircle, XCircle, RotateCcw, Scan, Package, MapPin, Camera } from 'lucide-react';
import { ApiService } from '../services/api';
import { Capacitor } from '@capacitor/core';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import jsQR from 'jsqr';
import { Html5Qrcode } from 'html5-qrcode';

type ScanResult = {
  success: boolean;
  name: string;
  phone?: string;
  message: string;
  isDelivery?: boolean;
  platform?: string;
  residentFlat?: string;
  residentName?: string;
  deliveryAddress?: string;
} | null;

const Corner = ({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) => {
  const r = pos.includes('r');
  const b = pos.includes('b');
  return (
    <div style={{
      position: 'absolute',
      [b ? 'bottom' : 'top']: 0,
      [r ? 'right' : 'left']: 0,
      width: 28, height: 28,
      borderTop: b ? 'none' : '3px solid var(--brand)',
      borderBottom: b ? '3px solid var(--brand)' : 'none',
      borderLeft: r ? 'none' : '3px solid var(--brand)',
      borderRight: r ? '3px solid var(--brand)' : 'none',
      borderRadius: pos === 'tl' ? '12px 0 0 0' : pos === 'tr' ? '0 12px 0 0' : pos === 'bl' ? '0 0 0 12px' : '0 0 12px 0',
      animation: 'corner-glow 2s ease-in-out infinite',
    }} />
  );
};

const IS_NATIVE = Capacitor.isNativePlatform();

const GuardHome: React.FC<{ user: any }> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult>(null);
  const [resultLoading, setResultLoading] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [nativeScanning, setNativeScanning] = useState(false);

  // Web scanner refs
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerStarted = useRef(false);

  // ──────────────────────────────────────────────────────────────
  // NATIVE: use @capacitor/camera to capture a photo then jsQR
  // ──────────────────────────────────────────────────────────────
  const scanNative = useCallback(async () => {
    setNativeScanning(true);
    setScannerError('');
    try {
      const photo = await CapCamera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        quality: 90,
        width: 800,
        correctOrientation: true,
        promptLabelHeader: 'Scan QR Code',
        promptLabelPhoto: '',
        promptLabelPicture: 'Take Photo',
      });

      if (!photo.dataUrl) throw new Error('No image captured');

      // Decode QR from the captured image
      const img = new Image();
      img.src = photo.dataUrl;
      await new Promise<void>((res) => { img.onload = () => res(); });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });

      if (code) {
        handleScanSuccess(code.data);
      } else {
        setScannerError('No QR code detected. Try again with better lighting.');
      }
    } catch (err: any) {
      if (!err.message?.includes('cancelled') && !err.message?.includes('cancel')) {
        setScannerError(err?.message || 'Could not open camera');
      }
    } finally {
      setNativeScanning(false);
    }
  }, []);

  // ──────────────────────────────────────────────────────────────
  // WEB: html5-qrcode continuous scanner
  // ──────────────────────────────────────────────────────────────
  const startWebScanner = useCallback(async () => {
    if (scannerStarted.current) return;
    scannerStarted.current = true;
    setScannerError('');
    try {
      const qr = new Html5Qrcode('qr-reader');
      scannerRef.current = qr;
      await qr.start(
        { facingMode: 'environment' },
        { fps: 15, qrbox: { width: 230, height: 230 }, aspectRatio: 1.0 },
        async (decodedText) => {
          await stopWebScanner();
          setScannerActive(false);
          handleScanSuccess(decodedText);
        },
        () => {}
      );
      setScannerActive(true);
    } catch (err: any) {
      scannerStarted.current = false;
      setScannerError(
        err?.message?.includes('Permission')
          ? 'Camera permission denied. Please allow camera access.'
          : err?.message || 'Could not start camera'
      );
    }
  }, []);

  const stopWebScanner = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
      scannerRef.current = null;
    }
    scannerStarted.current = false;
    setScannerActive(false);
  }, []);

  const restartScanner = useCallback(async () => {
    setScanResult(null);
    setScannerError('');
    if (IS_NATIVE) {
      scanNative();
    } else {
      await stopWebScanner();
      setTimeout(() => startWebScanner(), 300);
    }
  }, [scanNative, startWebScanner, stopWebScanner]);

  useEffect(() => {
    if (IS_NATIVE) {
      // On native, auto-open camera immediately
      scanNative();
    } else {
      startWebScanner();
      return () => { stopWebScanner(); };
    }
  }, []);

  // ──────────────────────────────────────────────────────────────
  // Shared QR handler
  // ──────────────────────────────────────────────────────────────
  const handleScanSuccess = async (qrValue: string) => {
    setResultLoading(true);
    try {
      if (qrValue.startsWith('DEL:')) {
        const res = await ApiService.scanDeliveryQr(qrValue);
        if (res.data.success && res.data.verified) {
          const { partner, delivery } = res.data;
          setScanResult({
            success: true,
            name: partner.fullName,
            message: 'Delivery partner admitted & logged ✅',
            isDelivery: true,
            platform: delivery.platform,
            residentFlat: delivery.residentFlat,
            residentName: delivery.residentName,
            deliveryAddress: delivery.orderInfo,
          });
        } else {
          setScanResult({ success: false, name: '', message: res.data.message || 'Delivery QR verification failed' });
        }
        return;
      }

      const res = await ApiService.verifyQr(qrValue);
      if (res.data.success && res.data.verified) {
        await ApiService.logEntry({
          visitorPhone: res.data.visitor.phone,
          destinationFlat: 'Pre-Approved',
          verificationMethod: 'PRE_APPROVAL',
          qrCodeValue: qrValue,
        });
        setScanResult({ success: true, name: res.data.visitor.name, phone: res.data.visitor.phone, message: 'Entry logged successfully ✅' });
      } else {
        setScanResult({ success: false, name: '', message: res.data.message || 'Invalid or expired QR code' });
      }
    } catch (err: any) {
      setScanResult({ success: false, name: '', message: err.response?.data?.message || 'Verification failed' });
    } finally { setResultLoading(false); }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const res = await ApiService.getHelpers(searchQuery);
      if (res.data.success && res.data.helpers.length > 0) {
        const helper = res.data.helpers[0];
        if (window.confirm(`Log entry for ${helper.fullName}?\n${helper.phoneNumber}`)) {
          await ApiService.logEntry({ visitorPhone: helper.phoneNumber, destinationFlat: 'Staff Entry', verificationMethod: 'PHONE_SEARCH' });
          setScanResult({ success: true, name: helper.fullName, phone: helper.phoneNumber, message: 'Staff entry logged ✅' });
          setSearchQuery('');
        }
      } else {
        alert('No staff found with that search.');
      }
    } catch { alert('Search failed. Check connection.'); }
    finally { setSearchLoading(false); }
  };

  const handleSOS = async () => {
    if (window.confirm('🚨 Send SOS Alert to Admin?')) {
      try {
        await ApiService.fileAlert({ description: 'SOS triggered by guard at main gate', severity: 'SOS' });
        setScanResult({ success: false, name: '', message: '🚨 SOS Alert sent to Admin' });
      } catch { alert('Failed to send SOS'); }
    }
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0A0A0F' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0A0A0F 0%, #1a0a0a 100%)', padding: '14px 18px', borderBottom: '1px solid rgba(229,57,53,0.15)', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
              <span style={{ color: '#22C55E', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Live · Main Gate</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: 'white' }}>Guard Scanner</h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: 'white', fontVariantNumeric: 'tabular-nums' }}>{timeStr}</p>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{dateStr}</p>
          </div>
        </div>

        <form onSubmit={handleSearch}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={15} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search staff by name or phone..."
                style={{ width: '100%', padding: '11px 14px 11px 38px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.07)', color: 'white', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>
            <button type="submit" disabled={searchLoading} style={{ padding: '11px 16px', borderRadius: 12, background: 'var(--brand)', border: 'none', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', flexShrink: 0 }}>
              {searchLoading ? '...' : 'Log'}
            </button>
          </div>
        </form>
      </div>

      {/* Main Camera Area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#0A0A0F', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 16px' }}>

        {IS_NATIVE ? (
          /* ── Native camera UI ─────────────────────────────── */
          <div style={{ width: '100%', maxWidth: 360, textAlign: 'center' }}>
            <div style={{
              width: '100%', aspectRatio: '1', background: 'rgba(255,255,255,0.04)',
              border: '1.5px solid rgba(229,57,53,0.25)', borderRadius: 24,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 16, marginBottom: 20,
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Animated scan line when active */}
              {nativeScanning && <div className="scanner-line" />}
              {(['tl','tr','bl','br'] as const).map(p => <Corner key={p} pos={p} />)}

              <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(229,57,53,0.15)', border: '1.5px solid rgba(229,57,53,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={36} color="var(--brand)" />
              </div>
              <div>
                <p style={{ color: 'white', fontWeight: 700, fontSize: 16, margin: '0 0 4px' }}>
                  {nativeScanning ? 'Opening camera...' : 'Tap to Scan QR'}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>
                  Uses native camera — works on all devices
                </p>
              </div>
            </div>

            {scannerError && (
              <div style={{ background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.3)', borderRadius: 12, padding: '10px 16px', marginBottom: 16 }}>
                <p style={{ color: '#FCA5A5', fontSize: 13, margin: '0 0 8px', fontWeight: 600 }}>{scannerError}</p>
              </div>
            )}

            <button
              onClick={scanNative}
              disabled={nativeScanning || resultLoading}
              style={{
                width: '100%', padding: '16px', borderRadius: 16,
                background: nativeScanning ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, var(--brand), #B71C1C)',
                border: 'none', color: 'white', fontSize: 16, fontWeight: 800, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: nativeScanning ? 'none' : '0 4px 24px rgba(229,57,53,0.4)',
              }}
            >
              {nativeScanning
                ? <><div style={{ width: 20, height: 20, border: '2.5px solid rgba(255,255,255,0.2)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Opening Camera...</>
                : <><Scan size={20} /> Scan QR Code</>
              }
            </button>
          </div>
        ) : (
          /* ── Web html5-qrcode UI ─────────────────────────── */
          <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
            <div className="scanner-frame" style={{ width: '100%', aspectRatio: '1', background: '#111', borderRadius: 20 }}>
              <div id="qr-reader" style={{ width: '100%', height: '100%', position: 'relative' }} />
              {scannerActive && <div className="scanner-line" />}
              {(['tl','tr','bl','br'] as const).map(p => <Corner key={p} pos={p} />)}
            </div>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              {scannerError ? (
                <div style={{ background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.3)', borderRadius: 12, padding: '10px 16px' }}>
                  <p style={{ color: '#FCA5A5', fontSize: 13, margin: '0 0 8px', fontWeight: 600 }}>{scannerError}</p>
                  <button onClick={restartScanner} style={{ background: 'var(--brand)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <RotateCcw size={14} /> Try Again
                  </button>
                </div>
              ) : scannerActive ? (
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Scan size={13} /> Point camera at visitor's QR code
                </p>
              ) : resultLoading ? (
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0 }}>Verifying QR...</p>
              ) : (
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, margin: 0 }}>Starting camera...</p>
              )}
            </div>
          </div>
        )}

        {/* Scan Result Card */}
        {(scanResult || resultLoading) && (
          <div style={{ position: IS_NATIVE ? 'relative' : 'absolute', bottom: IS_NATIVE ? 'auto' : 0, left: 0, right: 0, padding: '16px', marginTop: IS_NATIVE ? 16 : 0, background: IS_NATIVE ? 'transparent' : 'linear-gradient(to top, #0A0A0F 70%, transparent)' }}>
            <div style={{
              borderRadius: 20, padding: '16px 18px',
              background: resultLoading ? 'rgba(255,255,255,0.05)' : (scanResult?.success ? 'rgba(21,128,61,0.15)' : 'rgba(220,38,38,0.15)'),
              border: `1.5px solid ${resultLoading ? 'rgba(255,255,255,0.1)' : (scanResult?.success ? 'rgba(134,239,172,0.3)' : 'rgba(252,165,165,0.3)')}`,
              backdropFilter: 'blur(20px)',
            }}>
              {resultLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600, margin: 0 }}>Verifying with server...</p>
                </div>
              ) : scanResult && (
                <>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: scanResult.success ? (scanResult.isDelivery ? 'rgba(255,153,0,0.25)' : 'rgba(21,128,61,0.3)') : 'rgba(220,38,38,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {scanResult.isDelivery
                          ? <Package size={24} color="#FBBF24" />
                          : scanResult.success
                            ? <CheckCircle size={24} color="#4ADE80" />
                            : <XCircle size={24} color="#F87171" />
                        }
                      </div>
                      <div style={{ flex: 1 }}>
                        {scanResult.name && <p style={{ margin: '0 0 2px', fontWeight: 800, fontSize: 16, color: 'white' }}>{scanResult.name}</p>}
                        {scanResult.platform && <p style={{ margin: '0 0 2px', fontSize: 12, color: '#FBBF24', fontWeight: 700 }}>✦ Verified {scanResult.platform} Partner</p>}
                        {scanResult.phone && <p style={{ margin: '0 0 4px', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{scanResult.phone}</p>}
                        <p style={{ margin: 0, fontSize: 13, color: scanResult.success ? '#4ADE80' : '#F87171', fontWeight: 600 }}>{scanResult.message}</p>
                      </div>
                    </div>
                    <button onClick={() => setScanResult(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 10, flexShrink: 0, marginLeft: 8 }}>
                      <X size={16} color="rgba(255,255,255,0.6)" />
                    </button>
                  </div>

                  {scanResult.isDelivery && (scanResult.residentFlat || scanResult.residentName) && (
                    <div style={{ marginTop: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <MapPin size={14} color="#E57373" style={{ marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Delivering to</p>
                        {scanResult.residentName && <p style={{ margin: '1px 0 0', fontSize: 14, fontWeight: 700, color: 'white' }}>{scanResult.residentName}</p>}
                        <p style={{ margin: '1px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Flat {scanResult.residentFlat}</p>
                        {scanResult.deliveryAddress && <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{scanResult.deliveryAddress}</p>}
                      </div>
                    </div>
                  )}

                  <button onClick={restartScanner} style={{ marginTop: 12, width: '100%', padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <RotateCcw size={16} /> Scan Next
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SOS Button */}
      <div style={{ padding: '12px 16px 16px', background: '#0A0A0F', flexShrink: 0 }}>
        <button onClick={handleSOS} style={{
          width: '100%', padding: '16px', borderRadius: 16,
          background: 'linear-gradient(135deg, var(--brand), #B71C1C)',
          border: 'none', color: 'white', fontSize: 17, fontWeight: 900, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: '0 4px 24px rgba(229,57,53,0.4)', letterSpacing: 1,
        }}>
          <ShieldAlert size={22} /> SOS / EMERGENCY ALERT
        </button>
      </div>
    </div>
  );
};

export default GuardHome;
