import React, { useState } from 'react';
import { ChevronLeft, Star, Shield, Phone, MapPin, Briefcase, Clock, CheckCircle, ThumbsUp } from 'lucide-react';

interface HelperProfileProps {
  helper: any;
  onBack: () => void;
}

const HelperProfile: React.FC<HelperProfileProps> = ({ helper, onBack }) => {
  const [activeTab, setActiveTab] = useState<'about' | 'history' | 'reviews'>('about');

  const renderStars = (count: number) =>
    Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={14} color={i < Math.round(count) ? '#F59E0B' : '#E5E7EB'} fill={i < Math.round(count) ? '#F59E0B' : '#E5E7EB'} />
    ));

  return (
    <div style={{ background: 'var(--surface-2)', minHeight: '100%' }}>
      {/* Hero Section */}
      <div style={{ position: 'relative', background: 'white' }}>
        {/* Back button */}
        <button
          onClick={onBack}
          style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.9)', border: '1.5px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        >
          <ChevronLeft size={20} color="var(--text-primary)" />
        </button>

        {/* Cover gradient */}
        <div style={{ height: 120, background: 'linear-gradient(135deg, var(--brand) 0%, #B71C1C 100%)' }} />

        {/* Avatar */}
        <div style={{ padding: '0 20px', position: 'relative' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginTop: -44 }}>
            <img
              src={helper.photoUrl}
              alt={helper.fullName}
              onError={(e: any) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(helper.fullName)}&background=FECACA&color=991B1B&bold=true&size=150`; }}
              style={{ width: 90, height: 90, borderRadius: 24, objectFit: 'cover', border: '4px solid white', display: 'block', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
            />
            <div style={{ position: 'absolute', bottom: 2, right: 2, width: 24, height: 24, borderRadius: '50%', background: '#16A34A', border: '3px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={12} color="white" />
            </div>
          </div>

          <div style={{ paddingTop: 12, paddingBottom: 16 }}>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px' }}>{helper.fullName}</h1>
            <p style={{ color: 'var(--brand)', fontWeight: 700, fontSize: 15, margin: '0 0 10px' }}>{helper.jobTitle}</p>

            {/* Quick Stats */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {renderStars(helper.rating)}
                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginLeft: 4 }}>{helper.rating}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>({helper.totalJobs} jobs)</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'Experience', value: `${helper.yearsExp}+ yrs` },
                { label: 'Societies', value: `${helper.societies} worked` },
                { label: 'Rate', value: helper.rate },
              ].map(({ label, value }) => (
                <div key={label} style={{ textAlign: 'center', background: 'var(--surface-3)', borderRadius: 10, padding: '8px 14px' }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{value}</p>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Specialties */}
        <div style={{ padding: '0 20px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 14 }}>
            {helper.specialties.map((s: string) => (
              <span key={s} style={{ background: '#FEE2E2', border: '1px solid #FECACA', color: 'var(--brand)', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700 }}>
                {s}
              </span>
            ))}
            <span style={{ background: '#DCFCE7', border: '1px solid #86EFAC', color: '#15803D', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Shield size={11} /> Society Verified
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'white', borderBottom: '2px solid var(--border)', display: 'flex', marginTop: 8 }}>
        {(['about', 'history', 'reviews'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '14px 8px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 700, textTransform: 'capitalize', letterSpacing: 0.3,
              color: activeTab === tab ? 'var(--brand)' : 'var(--text-muted)',
              borderBottom: activeTab === tab ? '2px solid var(--brand)' : '2px solid transparent',
              marginBottom: -2, transition: 'all 0.15s'
            }}
          >
            {tab === 'about' ? 'About' : tab === 'history' ? 'Work History' : `Reviews (${helper.reviews.length})`}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ padding: '16px' }}>

        {/* ABOUT */}
        {activeTab === 'about' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'fade-slide-up 0.3s ease' }}>
            <div className="sn-card" style={{ padding: 16 }}>
              <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>About</p>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{helper.bio}</p>
            </div>

            <div className="sn-card" style={{ padding: 16 }}>
              <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>Contact</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone size={16} color="#15803D" />
                </div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>{helper.phoneNumber}</p>
              </div>
            </div>

            <button className="sn-btn-primary" onClick={() => alert(`Booking feature coming soon! Contact ${helper.fullName} at ${helper.phoneNumber}`)}>
              📅 Book {helper.fullName}
            </button>
          </div>
        )}

        {/* WORK HISTORY */}
        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, animation: 'fade-slide-up 0.3s ease', position: 'relative' }}>
            {/* Timeline line */}
            <div style={{ position: 'absolute', left: 30, top: 24, bottom: 24, width: 2, background: 'var(--border)' }} />

            {helper.workHistory.map((item: any, i: number) => (
              <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 20, position: 'relative' }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: item.status === 'current' ? '#FEE2E2' : 'white', border: `2px solid ${item.status === 'current' ? 'var(--brand)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                  <Briefcase size={18} color={item.status === 'current' ? 'var(--brand)' : 'var(--text-muted)'} />
                </div>
                <div className="sn-card" style={{ flex: 1, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>{item.society}</p>
                    {item.status === 'current' && (
                      <span className="sn-badge-success" style={{ flexShrink: 0 }}>Current</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <MapPin size={12} color="var(--text-muted)" />
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{item.location}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={12} color="var(--text-muted)" />
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{item.duration} · {item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* REVIEWS */}
        {activeTab === 'reviews' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'fade-slide-up 0.3s ease' }}>
            {/* Summary */}
            <div className="sn-card" style={{ padding: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px', fontSize: 44, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{helper.rating}</p>
                <div style={{ display: 'flex', gap: 2, justifyContent: 'center' }}>{renderStars(helper.rating)}</div>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>{helper.totalJobs} reviews</p>
              </div>
              <div style={{ flex: 1, borderLeft: '1px solid var(--border)', paddingLeft: 16 }}>
                {[5, 4, 3].map(stars => {
                  const pct = stars === 5 ? 75 : stars === 4 ? 20 : 5;
                  return (
                    <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', width: 12 }}>{stars}</span>
                      <Star size={11} color="#F59E0B" fill="#F59E0B" />
                      <div style={{ flex: 1, height: 6, background: 'var(--surface-3)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: '#F59E0B', borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 28 }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Individual reviews */}
            {helper.reviews.map((review: any, i: number) => (
              <div key={i} className="sn-card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, color: 'var(--brand)' }}>
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{review.name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>Flat {review.flat}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 2 }}>{renderStars(review.stars)}</div>
                </div>
                <p style={{ margin: '0 0 10px', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>
                  "{review.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12 }}>
                  <ThumbsUp size={12} />
                  <span>{2 + (i * 3)} people found this helpful</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HelperProfile;
