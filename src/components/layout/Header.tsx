import React from 'react';
import { Bell, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from './Sidebar';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onNotifications?: () => void;
  notificationCount?: number;
  action?: React.ReactNode;
}

export function Header({ title, subtitle, onBack, onNotifications, notificationCount = 0, action }: HeaderProps) {
  const { profile } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-slate-100">
      <div className="flex items-center gap-3 px-4 py-3 max-w-5xl mx-auto">
        {onBack && (
          <button onClick={onBack} className="p-1.5 -ml-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
        )}

        {!onBack && (
          <div className="lg:hidden flex items-center gap-2 mr-1">
            <div className="w-7 h-7 rounded-lg bg-navy-800 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">FC</span>
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-navy-800 leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
        </div>

        {action && <div className="flex-shrink-0">{action}</div>}

        <button
          onClick={onNotifications}
          className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors flex-shrink-0"
        >
          <Bell size={20} className="text-slate-600" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        <div className="lg:hidden flex-shrink-0">
          <Avatar name={profile?.full_name ?? 'U'} size="sm" />
        </div>
      </div>
    </header>
  );
}
