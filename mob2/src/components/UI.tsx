import React from 'react';

export const UserAvatar: React.FC<{ name?: string; radius?: number; src?: string }> = ({ name, radius = 24, src }) => {
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  
  return (
    <div 
      className="flex items-center justify-center bg-purple-500/20 border border-purple-500/30 rounded-full overflow-hidden"
      style={{ width: radius * 2, height: radius * 2 }}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-purple-500 font-bold" style={{ fontSize: radius * 0.8 }}>
          {initials}
        </span>
      )}
    </div>
  );
};

export const SectionHeader: React.FC<{ title: string; action?: React.ReactNode }> = ({ title, action }) => (
  <div className="flex items-center justify-between mb-4 mt-6">
    <h3 className="text-lg font-bold text-gray-200">{title}</h3>
    {action}
  </div>
);

export const StatusBadge: React.FC<{ label: string; color?: string }> = ({ label, color = 'bg-gray-500/20 text-gray-400' }) => (
  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${color}`}>
    {label}
  </span>
);

export const PrimaryButton: React.FC<{ 
  text: string; 
  onPressed: () => void; 
  isLoading?: boolean; 
  icon?: React.ReactNode;
  disabled?: boolean;
}> = ({ text, onPressed, isLoading, icon, disabled }) => (
  <button
    onClick={onPressed}
    disabled={isLoading || disabled}
    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
  >
    {isLoading ? (
      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    ) : (
      <>
        {text}
        {icon}
      </>
    )}
  </button>
);
