import React, { useState, useEffect } from 'react';
import {
  CheckCircle, Clock, MapPin, Phone, Star, Briefcase,
  CalendarDays, LogIn, LogOut, Bell, ChevronRight, User
} from 'lucide-react';

interface HelperHomeProps {
  user: any;
}

const HelperHome: React.FC<HelperHomeProps> = ({ user }) => {
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = () => {
    if (!checkedIn) {
      setCheckedIn(true);
      setCheckInTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    } else {
      setCheckedIn(false);
      setCheckInTime(null);
    }
  };

  const schedule = [
    { flat: 'A-101', resident: 'Priya Sharma', time: '09:00 AM', task: 'Cooking', status: checkedIn ? 'done' : 'pending' },
    { flat: 'B-204', resident: 'Rajan Mehta', time: '11:00 AM', task: 'Cleaning', status: 'pending' },
    { flat: 'A-305', resident: 'Sunita Devi', time: '02:00 PM', task: 'Cooking + Cleaning', status: 'pending' },
  ];

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.phoneNumber?.slice(-2) || 'H');

  const greeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div style={{ background: 'var(--surface-2)', minHeight: '100%' }}>

      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #E53935 0%, #B71C1C 100%)',
        padding: '28px 20px 36px',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ position: 'absolute', bottom: -20, right: 40, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
          <div style={{
            width: 58, height: 58, borderRadius: 18, background: 'rgba(255,255,255,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 900, color: 'white', border: '2px solid rgba(255,255,255,0.35)',
            flexShrink: 0
          }}>
            {initials}
          </div>
          <div>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600 }}>
              {greeting()},
            </p>
            <h2 style={{ margin: '2px 0 0', color: 'white', fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>
              {user?.fullName || 'Helper'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: checkedIn ? '#4ADE80' : 'rgba(255,255,255,0.4)' }} />
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 600 }}>
                {checkedIn ? `Checked in at ${checkInTime}` : 'Not checked in today'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 20 }}>
          {[
            { label: 'Today\'s Jobs', value: schedule.length },
            { label: 'Rating', value: '4.8 ★' },
            { label: 'This Month', value: '22 days' },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.15)', borderRadius: 12,
              padding: '10px 8px', textAlign: 'center',
              backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <p style={{ margin: 0, color: 'white', fontWeight: 900, fontSize: 18 }}>{value}</p>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: 600, marginTop: 2 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Check In / Out Button */}
        <button
          onClick={handleCheckIn}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: 16,
            border: 'none',
            cursor: 'pointer',
            background: checkedIn
              ? 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)'
              : 'linear-gradient(135deg, #E53935 0%, #B71C1C 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            boxShadow: checkedIn
              ? '0 6px 20px rgba(22,163,74,0.35)'
              : '0 6px 20px rgba(229,57,53,0.35)',
            transition: 'all 0.3s ease',
          }}
        >
          {checkedIn
            ? <><LogOut size={22} color="white" /><span style={{ color: 'white', fontWeight: 800, fontSize: 17 }}>Check Out</span></>
            : <><LogIn size={22} color="white" /><span style={{ color: 'white', fontWeight: 800, fontSize: 17 }}>Check In for Today</span></>
          }
        </button>

        {/* Today's Schedule */}
        <div className="sn-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarDays size={16} color="var(--brand)" />
            </div>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>Today's Schedule</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {schedule.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 12,
                background: item.status === 'done' ? '#F0FDF4' : 'var(--surface-3)',
                border: `1px solid ${item.status === 'done' ? '#BBF7D0' : 'var(--border)'}`,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: item.status === 'done' ? '#DCFCE7' : '#FEE2E2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {item.status === 'done'
                    ? <CheckCircle size={18} color="#16A34A" />
                    : <Clock size={18} color="var(--brand)" />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>{item.task}</p>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                      background: item.status === 'done' ? '#DCFCE7' : '#FEE2E2',
                      color: item.status === 'done' ? '#15803D' : 'var(--brand)',
                    }}>
                      {item.status === 'done' ? 'Done' : item.time}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <MapPin size={11} color="var(--text-muted)" />
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                      {item.flat} · {item.resident}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Info */}
        <div className="sn-card" style={{ padding: 16 }}>
          <p style={{ margin: '0 0 14px', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>My Info</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: Phone, label: 'Phone', value: user?.phoneNumber || '—', color: '#16A34A', bg: '#DCFCE7' },
              { icon: Briefcase, label: 'Role', value: 'Helper / Domestic Staff', color: '#E53935', bg: '#FEE2E2' },
              { icon: Star, label: 'Rating', value: '4.8 / 5.0', color: '#D97706', bg: '#FEF3C7' },
              { icon: User, label: 'Account', value: 'Verified ✓', color: '#7C3AED', bg: '#EDE9FE' },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color={color} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</p>
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)', fontWeight: 700 }}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notices */}
        <div className="sn-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Bell size={16} color="var(--brand)" />
            <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>Notices</p>
          </div>
          {[
            { msg: 'Society meeting on Sunday 10 AM in the community hall.', time: '2h ago' },
            { msg: 'Please carry your ID card at all times for gate entry.', time: '1d ago' },
          ].map((n, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              padding: '10px 0', borderBottom: i === 0 ? '1px solid var(--border)' : 'none'
            }}>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1, paddingRight: 8 }}>{n.msg}</p>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>{n.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelperHome;
