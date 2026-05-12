import React, { useState, useEffect } from 'react';
import { Star, Search, Shield, ChevronRight } from 'lucide-react';
import { ApiService } from '../services/api';
import { enrichHelper } from '../services/helperData';
import HelperProfile from './HelperProfile';

const CATEGORIES = ['All', 'Cook', 'Maid', 'Driver', 'Nanny'];

const HelpersList: React.FC<{ user?: any }> = () => {
  const [helpers, setHelpers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedHelper, setSelectedHelper] = useState<any | null>(null);

  useEffect(() => { fetchHelpers(); }, [searchQuery]);

  const fetchHelpers = async () => {
    try {
      const res = await ApiService.getHelpers(searchQuery);
      if (res.data.success) {
        setHelpers(res.data.helpers.map(enrichHelper));
      }
    } catch (error) {
      console.error('Failed to fetch helpers', error);
    } finally { setLoading(false); }
  };

  const filtered = activeCategory === 'All'
    ? helpers
    : helpers.filter(h => h.jobTitle === activeCategory);

  if (selectedHelper) {
    return <HelperProfile helper={selectedHelper} onBack={() => setSelectedHelper(null)} />;
  }

  return (
    <div>
      {/* Red Header */}
      <div style={{ background: 'var(--brand)', padding: '20px 20px 24px', color: 'white' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 16px', letterSpacing: -0.5 }}>Discover Services</h1>
        <div style={{ position: 'relative' }}>
          <Search size={18} color="#bbb" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search for cook, maid, nanny..."
            style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 12, border: 'none', background: 'white', fontSize: 14, outline: 'none', color: 'var(--text-primary)', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Category Chips */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '12px 16px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={`sn-chip ${activeCategory === cat ? 'active' : ''}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ padding: '12px 16px 8px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
            Finding helpers...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <Search size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p style={{ fontWeight: 600 }}>No helpers found</p>
          </div>
        ) : (
          filtered.map((helper, i) => (
            <div
              key={helper.id}
              className="sn-card animate-entry"
              onClick={() => setSelectedHelper(helper)}
              style={{ marginBottom: 12, padding: 16, animationDelay: `${i * 0.06}s`, cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                {/* Indian Photo */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={helper.photoUrl}
                    alt={helper.fullName}
                    onError={(e: any) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(helper.fullName)}&background=FECACA&color=991B1B&bold=true&size=80`; }}
                    style={{ width: 68, height: 68, borderRadius: 18, objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ position: 'absolute', bottom: -4, right: -4, width: 20, height: 20, borderRadius: '50%', background: '#16A34A', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{helper.fullName}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '3px 7px', flexShrink: 0, marginLeft: 8 }}>
                      <Star size={11} color="#F59E0B" fill="#F59E0B" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#92400E' }}>{helper.rating}</span>
                    </div>
                  </div>

                  <p style={{ color: 'var(--brand)', fontWeight: 700, fontSize: 13, margin: '0 0 6px' }}>
                    {helper.jobTitle} · {helper.rate}
                  </p>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {helper.specialties.slice(0, 2).map((tag: string) => (
                      <span key={tag} style={{ background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--success)', fontSize: 13, fontWeight: 600 }}>
                  <Shield size={14} color="var(--success)" />
                  Trusted in {helper.societies} societ{helper.societies > 1 ? 'ies' : 'y'}
                </div>
                <span style={{ color: 'var(--brand)', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                  View Profile <ChevronRight size={14} />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HelpersList;
