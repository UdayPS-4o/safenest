import React, { useState } from 'react';
import { Home, Search, Users, LogOut, BarChart2, UserPlus, CreditCard, QrCode, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ResidentHome from './ResidentHome';
import HelpersList from './HelpersList';
import Household from './Household';
import GuardHome from './GuardHome';
import GuardLog from './GuardLog';
import AdminOverview from './AdminOverview';
import UserManagement from './UserManagement';
import CardManagement from './CardManagement';

const Shell: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const role = user?.role || 'RESIDENT';

  const getPages = () => {
    switch (role) {
      case 'GUARD':
        return [<GuardHome user={user} />, <GuardLog user={user} />];
      case 'ADMIN':
        return [<AdminOverview user={user} />, <UserManagement user={user} />, <CardManagement user={user} />];
      case 'RESIDENT':
      default:
        return [<ResidentHome user={user} />, <HelpersList user={user} />, <Household user={user} />];
    }
  };

  const getNavItems = () => {
    switch (role) {
      case 'GUARD':
        return [
          { icon: QrCode, label: 'Scanner' },
          { icon: ClipboardList, label: 'Log' },
        ];
      case 'ADMIN':
        return [
          { icon: BarChart2, label: 'Overview' },
          { icon: UserPlus, label: 'Users' },
          { icon: CreditCard, label: 'Cards' },
        ];
      default:
        return [
          { icon: Home, label: 'Home' },
          { icon: Search, label: 'Helpers' },
          { icon: Users, label: 'Household' },
        ];
    }
  };

  const pages = getPages();
  const navItems = getNavItems();

  const getRoleBadgeStyle = () => {
    switch (role) {
      case 'GUARD': return { bg: '#FEF3C7', color: '#92400E', text: 'Guard' };
      case 'ADMIN': return { bg: '#EDE9FE', color: '#5B21B6', text: 'Admin' };
      default: return { bg: '#DCFCE7', color: '#14532D', text: 'Resident' };
    }
  };
  const badge = getRoleBadgeStyle();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface-2)', overflow: 'hidden' }}>
      {/* App Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 60, background: 'white',
        borderBottom: '1px solid var(--border)', flexShrink: 0,
        boxShadow: '0 1px 0 rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 900, fontSize: 14 }}>SN</span>
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: -0.5 }}>SafeNest</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ background: badge.bg, color: badge.color, borderRadius: 100, padding: '4px 10px', fontSize: 12, fontWeight: 700 }}>
            {badge.text}
          </span>
          <button
            onClick={logout}
            style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-3)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <LogOut size={16} color="var(--text-secondary)" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div className="page-scroll" style={{ height: '100%', paddingBottom: 72 }}>
          {pages[currentIndex]}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        height: 68, background: 'white', borderTop: '1px solid var(--border)',
        position: 'absolute', bottom: 0, left: 0, right: 0, maxWidth: 430, margin: '0 auto',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.06)'
      }}>
        {navItems.map((item, i) => {
          const Icon = item.icon;
          const active = currentIndex === i;
          return (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '8px 20px', borderRadius: 12, background: 'none', border: 'none',
                cursor: 'pointer', transition: 'all 0.15s',
                color: active ? 'var(--brand)' : 'var(--text-muted)',
              }}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {item.label}
              </span>
              {active && <div style={{ position: 'absolute', bottom: 0, width: 32, height: 3, background: 'var(--brand)', borderRadius: '3px 3px 0 0' }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Shell;
