import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Tag, Home, Gift, X, Phone, MapPin, Clock, Trash2, CheckCircle, ChevronDown, RefreshCw } from 'lucide-react';
import { ApiService } from '../services/api';

type ListingType = 'ALL' | 'SELL' | 'RENT' | 'FREE';
type Listing = {
  id: number; title: string; description: string; type: 'SELL' | 'RENT' | 'FREE';
  price: number | null; rentPeriod: string | null; category: string;
  imageUrl: string | null; sellerFlat: string; sellerName: string;
  sellerPhone: string; status: string; createdAt: string;
  sellerId: number;
};

const CATEGORIES = ['Electronics', 'Furniture', 'Books', 'Sports', 'Clothing', 'Kitchen', 'Toys', 'Vehicles', 'Music', 'Other'];
const RENT_PERIODS = ['per day', 'per week', 'per month'];

const TYPE_CONFIG = {
  SELL: { label: 'For Sale', color: '#E53935', bg: 'rgba(229,57,53,0.12)', emoji: '🏷️' },
  RENT: { label: 'For Rent', color: '#1E88E5', bg: 'rgba(30,136,229,0.12)', emoji: '🔑' },
  FREE: { label: 'Free / Give Away', color: '#43A047', bg: 'rgba(67,160,71,0.12)', emoji: '🎁' },
};

const Marketplace: React.FC<{ user: any }> = ({ user }) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ListingType>('ALL');
  const [search, setSearch] = useState('');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [myListings, setMyListings] = useState(false);

  // Create form state
  const [form, setForm] = useState({ title: '', description: '', type: 'SELL' as 'SELL'|'RENT'|'FREE', price: '', rentPeriod: 'per day', category: 'Other', imageUrl: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = myListings ? ApiService.getMyListings() : ApiService.getListings({
        type: filter !== 'ALL' ? filter : undefined,
        search: search || undefined,
      });
      const res = await endpoint;
      let data = res.data.listings || [];
      if (myListings && filter !== 'ALL') data = data.filter((l: Listing) => l.type === filter);
      setListings(data);
    } catch { setListings([]); }
    finally { setLoading(false); }
  }, [filter, search, myListings]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setCreateError('Enter a title'); return; }
    if (form.type !== 'FREE' && !form.price) { setCreateError('Enter a price'); return; }
    setCreating(true); setCreateError('');
    try {
      await ApiService.createListing({
        title: form.title, description: form.description,
        type: form.type, price: form.type !== 'FREE' ? parseInt(form.price) : undefined,
        rentPeriod: form.type === 'RENT' ? form.rentPeriod : undefined,
        category: form.category, imageUrl: form.imageUrl || undefined,
      });
      setShowCreate(false);
      setForm({ title: '', description: '', type: 'SELL', price: '', rentPeriod: 'per day', category: 'Other', imageUrl: '' });
      fetchListings();
    } catch (err: any) { setCreateError(err.response?.data?.message || 'Failed to create'); }
    finally { setCreating(false); }
  };

  const handleStatusChange = async (id: number, status: 'SOLD' | 'RENTED' | 'CLOSED') => {
    await ApiService.updateListingStatus(id, status);
    setSelectedListing(null);
    fetchListings();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this listing?')) return;
    await ApiService.deleteListing(id);
    setSelectedListing(null);
    fetchListings();
  };

  const formatPrice = (l: Listing) => {
    if (l.type === 'FREE') return 'Free';
    if (l.type === 'RENT') return `₹${l.price?.toLocaleString()} ${l.rentPeriod || ''}`;
    return `₹${l.price?.toLocaleString()}`;
  };

  const timeAgo = (dt: string) => {
    const diff = Date.now() - new Date(dt).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 12,
    border: '1.5px solid var(--border)', background: 'var(--surface-3)',
    color: 'var(--text-primary)', fontSize: 14, outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface-2)' }}>
      {/* Header */}
      <div style={{ background: 'white', padding: '16px 16px 0', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: 'var(--text-primary)' }}>Society Market</h2>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>Buy · Sell · Rent within your society</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={fetchListings} style={{ background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 10, padding: 9, cursor: 'pointer', display: 'flex' }}>
              <RefreshCw size={16} color="var(--text-muted)" />
            </button>
            <button
              onClick={() => setShowCreate(true)}
              style={{ background: 'var(--brand)', border: 'none', borderRadius: 12, padding: '9px 14px', cursor: 'pointer', color: 'white', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 3px 14px rgba(229,57,53,0.3)' }}
            >
              <Plus size={16} /> Sell / Rent
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." style={{ ...inp, paddingLeft: 36, marginBottom: 0, background: 'var(--surface-2)' }} />
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, paddingBottom: 12, overflowX: 'auto' }}>
          {(['ALL', 'SELL', 'RENT', 'FREE'] as ListingType[]).map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{
              padding: '6px 14px', borderRadius: 100, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
              background: filter === t ? 'var(--brand)' : 'var(--surface-3)',
              color: filter === t ? 'white' : 'var(--text-secondary)',
            }}>
              {t === 'ALL' ? '🛍️ All' : `${TYPE_CONFIG[t].emoji} ${TYPE_CONFIG[t].label}`}
            </button>
          ))}
          <button onClick={() => { setMyListings(!myListings); }} style={{
            padding: '6px 14px', borderRadius: 100, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', marginLeft: 'auto',
            background: myListings ? '#1E88E5' : 'var(--surface-3)',
            color: myListings ? 'white' : 'var(--text-secondary)',
          }}>
            My Listings
          </button>
        </div>
      </div>

      {/* Listings grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{myListings ? "You haven't listed anything yet" : 'No listings right now'}</p>
            <button onClick={() => setShowCreate(true)} style={{ marginTop: 12, padding: '10px 20px', borderRadius: 12, background: 'var(--brand)', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
              + Post a Listing
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {listings.map(l => {
              const tc = TYPE_CONFIG[l.type];
              return (
                <div key={l.id} onClick={() => setSelectedListing(l)} style={{
                  background: 'white', borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                  border: '1px solid var(--border)', boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}>
                  {/* Image or placeholder */}
                  <div style={{ height: 110, background: l.imageUrl ? `url(${l.imageUrl}) center/cover` : 'linear-gradient(135deg, #f5f5f5, #e0e0e0)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {!l.imageUrl && <span style={{ fontSize: 36 }}>{tc.emoji}</span>}
                    <span style={{ position: 'absolute', top: 8, left: 8, background: tc.bg, color: tc.color, fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 100 }}>
                      {tc.label}
                    </span>
                    {l.status !== 'ACTIVE' && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: 'white', fontWeight: 900, fontSize: 14, background: 'rgba(0,0,0,0.6)', padding: '4px 12px', borderRadius: 8 }}>{l.status}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <p style={{ margin: '0 0 3px', fontWeight: 800, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</p>
                    <p style={{ margin: '0 0 6px', fontWeight: 900, fontSize: 15, color: tc.color }}>{formatPrice(l)}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 6, fontWeight: 600 }}>{l.category}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{timeAgo(l.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Listing Detail Modal ── */}
      {selectedListing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }} onClick={() => setSelectedListing(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '24px 24px 0 0', padding: '0 0 32px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            {selectedListing.imageUrl ? (
              <div style={{ height: 200, background: `url(${selectedListing.imageUrl}) center/cover`, flexShrink: 0 }} />
            ) : (
              <div style={{ height: 120, background: 'linear-gradient(135deg, #ffeee8, #fff0f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 }}>
                {TYPE_CONFIG[selectedListing.type].emoji}
              </div>
            )}
            <div style={{ padding: '18px 20px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: TYPE_CONFIG[selectedListing.type].color, background: TYPE_CONFIG[selectedListing.type].bg, padding: '3px 8px', borderRadius: 100 }}>
                    {TYPE_CONFIG[selectedListing.type].label}
                  </span>
                  <h3 style={{ margin: '8px 0 4px', fontSize: 20, fontWeight: 900, color: 'var(--text-primary)' }}>{selectedListing.title}</h3>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: TYPE_CONFIG[selectedListing.type].color }}>{formatPrice(selectedListing)}</p>
                </div>
                <button onClick={() => setSelectedListing(null)} style={{ background: 'var(--surface-2)', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer' }}>
                  <X size={18} color="var(--text-muted)" />
                </button>
              </div>

              {selectedListing.description && (
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, margin: '12px 0' }}>{selectedListing.description}</p>
              )}

              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8, background: 'var(--surface-2)', color: 'var(--text-muted)', fontWeight: 600 }}>{selectedListing.category}</span>
                <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8, background: 'var(--surface-2)', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={11} /> {timeAgo(selectedListing.createdAt)}
                </span>
              </div>

              {/* Seller info */}
              <div style={{ background: 'var(--surface-2)', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
                <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Listed By</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 16, flexShrink: 0 }}>
                    {(selectedListing.sellerName || '?')[0]}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 800, color: 'var(--text-primary)' }}>{selectedListing.sellerName || 'Resident'}</p>
                    {selectedListing.sellerFlat && (
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={10} /> Flat {selectedListing.sellerFlat}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {selectedListing.sellerId !== user?.id ? (
                <a href={`tel:${selectedListing.sellerPhone}`} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  width: '100%', padding: '15px', borderRadius: 14,
                  background: 'linear-gradient(135deg, #43A047, #2E7D32)',
                  border: 'none', color: 'white', fontSize: 16, fontWeight: 800,
                  textDecoration: 'none', boxShadow: '0 4px 16px rgba(67,160,71,0.3)', boxSizing: 'border-box',
                }}>
                  <Phone size={18} /> Call Seller
                </a>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center', textTransform: 'uppercase' }}>My Listing — Update Status</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {selectedListing.type === 'SELL' && selectedListing.status === 'ACTIVE' && (
                      <button onClick={() => handleStatusChange(selectedListing.id, 'SOLD')} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: '#43A047', color: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <CheckCircle size={16} /> Mark Sold
                      </button>
                    )}
                    {selectedListing.type === 'RENT' && selectedListing.status === 'ACTIVE' && (
                      <button onClick={() => handleStatusChange(selectedListing.id, 'RENTED')} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: '#1E88E5', color: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <CheckCircle size={16} /> Mark Rented
                      </button>
                    )}
                    {selectedListing.status !== 'ACTIVE' && (
                      <button onClick={() => handleStatusChange(selectedListing.id, 'ACTIVE')} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: 'var(--surface-3)', color: 'var(--text-primary)', fontWeight: 800, cursor: 'pointer' }}>
                        Re-Activate
                      </button>
                    )}
                    <button onClick={() => handleDelete(selectedListing.id)} style={{ padding: '12px 16px', borderRadius: 12, border: 'none', background: 'rgba(229,57,53,0.1)', color: 'var(--brand)', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Create Listing Modal ── */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }} onClick={() => setShowCreate(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '24px 24px 0 0', padding: '20px 20px 40px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: 'var(--text-primary)' }}>Post a Listing</h3>
              <button onClick={() => setShowCreate(false)} style={{ background: 'var(--surface-2)', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer' }}>
                <X size={18} color="var(--text-muted)" />
              </button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Type */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {(['SELL', 'RENT', 'FREE'] as const).map(t => (
                    <button type="button" key={t} onClick={() => setForm(f => ({ ...f, type: t }))} style={{
                      padding: '10px 6px', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 12,
                      border: `2px solid ${form.type === t ? TYPE_CONFIG[t].color : 'var(--border)'}`,
                      background: form.type === t ? TYPE_CONFIG[t].bg : 'var(--surface-2)',
                      color: form.type === t ? TYPE_CONFIG[t].color : 'var(--text-secondary)',
                    }}>
                      {TYPE_CONFIG[t].emoji} {TYPE_CONFIG[t].label.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Item Name *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Fender Guitar, Study Table" style={inp} />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Condition, brand, any details..." rows={3} style={{ ...inp, resize: 'none' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: form.type === 'RENT' ? '1fr 1fr' : '1fr', gap: 10 }}>
                {form.type !== 'FREE' && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Price (₹) *</label>
                    <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="e.g. 5000" style={inp} />
                  </div>
                )}
                {form.type === 'RENT' && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Rent Period</label>
                    <select value={form.rentPeriod} onChange={e => setForm(f => ({ ...f, rentPeriod: e.target.value }))} style={{ ...inp }}>
                      {RENT_PERIODS.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inp}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Image URL <span style={{ opacity: 0.5, textTransform: 'none' }}>(optional)</span></label>
                <input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." style={inp} />
              </div>

              {createError && <p style={{ color: 'var(--brand)', fontSize: 13, fontWeight: 600, margin: 0 }}>{createError}</p>}

              <button type="submit" disabled={creating} style={{
                padding: '15px', borderRadius: 14, border: 'none', cursor: creating ? 'not-allowed' : 'pointer',
                background: creating ? 'var(--surface-3)' : 'linear-gradient(135deg, var(--brand), #B71C1C)',
                color: creating ? 'var(--text-muted)' : 'white', fontWeight: 800, fontSize: 15,
                boxShadow: creating ? 'none' : '0 4px 16px rgba(229,57,53,0.3)',
              }}>
                {creating ? 'Posting...' : '🚀 Post Listing'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
