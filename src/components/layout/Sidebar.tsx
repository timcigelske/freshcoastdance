import React from 'react';
import {
  Home, MessageCircle, Calendar, Users, Bell,
  FileText, CheckSquare, Settings, LogOut, ChevronRight,
  Megaphone, Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  current: string;
  onNavigate: (page: string) => void;
}

const mainNav = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'groups', label: 'Groups', icon: Users },
  { id: 'messages', label: 'Messages', icon: MessageCircle },
  { id: 'files', label: 'Files', icon: FileText },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
];

const bottomNav = [
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function Avatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return (
    <div className={`${sz} rounded-full bg-navy-800 text-white flex items-center justify-center font-semibold flex-shrink-0`}>
      {initials}
    </div>
  );
}

export function Sidebar({ current, onNavigate }: SidebarProps) {
  const { profile, signOut } = useAuth();
  const isStaff = profile?.role && ['owner', 'admin', 'teacher'].includes(profile.role);

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white border-r border-slate-100 z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-navy-800 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">FC</span>
          </div>
          <div>
            <p className="text-sm font-bold text-navy-800 leading-tight">Fresh Coast</p>
            <p className="text-xs text-slate-500 leading-tight">Connect</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {mainNav.map(({ id, label, icon: Icon }) => {
          if (id === 'admin' && !isStaff) return null;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full text-left ${current === id ? 'sidebar-item-active' : 'sidebar-item'}`}
            >
              <Icon size={18} strokeWidth={current === id ? 2.5 : 1.8} />
              {label}
            </button>
          );
        })}

        {isStaff && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Studio</p>
            </div>
            <button
              onClick={() => onNavigate('admin')}
              className={`w-full text-left ${current === 'admin' ? 'sidebar-item-active' : 'sidebar-item'}`}
            >
              <Shield size={18} strokeWidth={current === 'admin' ? 2.5 : 1.8} />
              Admin Console
            </button>
          </>
        )}
      </nav>

      {/* User section */}
      <div className="px-3 pb-4 pt-2 border-t border-slate-100 space-y-0.5">
        {bottomNav.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`w-full text-left ${current === id ? 'sidebar-item-active' : 'sidebar-item'}`}
          >
            <Icon size={18} strokeWidth={1.8} />
            {label}
          </button>
        ))}
        <button
          onClick={signOut}
          className="w-full text-left sidebar-item text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut size={18} strokeWidth={1.8} />
          Sign Out
        </button>
        <div className="flex items-center gap-2.5 px-3 py-2.5 mt-1">
          <Avatar name={profile?.full_name ?? 'User'} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800 truncate">{profile?.full_name}</p>
            <p className="text-xs text-slate-500 capitalize">{profile?.role}</p>
          </div>
          <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
}

export { Avatar };
