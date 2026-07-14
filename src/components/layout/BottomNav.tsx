import React from 'react';
import { Home, MessageCircle, Calendar, Users, MoreHorizontal } from 'lucide-react';

interface BottomNavProps {
  current: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'messages', label: 'Messages', icon: MessageCircle },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'groups', label: 'Groups', icon: Users },
  { id: 'more', label: 'More', icon: MoreHorizontal },
];

export function BottomNav({ current, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex items-center justify-around px-2 pb-safe z-40 lg:hidden"
         style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
      {navItems.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onNavigate(id)}
          className={current === id ? 'nav-item-active' : 'nav-item'}
        >
          <Icon size={20} strokeWidth={current === id ? 2.5 : 1.8} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
