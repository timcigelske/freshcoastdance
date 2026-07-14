import React from 'react';
import {
  Megaphone, Calendar, FileText, CheckSquare, Shield,
  Settings, LogOut, Bell, ChevronRight, User
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/layout/Header';

export function MorePage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { profile, signOut } = useAuth();
  const isStaff = profile?.role && ['owner', 'admin', 'teacher'].includes(profile.role);

  const sections = [
    {
      title: 'Studio',
      items: [
        { icon: Megaphone, label: 'Announcements', page: 'announcements', desc: 'Posts and updates from the studio' },
        { icon: Calendar, label: 'Calendar', page: 'calendar', desc: 'Classes, rehearsals and events' },
        { icon: FileText, label: 'Files', page: 'files', desc: 'Documents, music and media' },
        { icon: CheckSquare, label: 'Tasks', page: 'tasks', desc: 'Actions and forms to complete' },
      ]
    },
    ...(isStaff ? [{
      title: 'Staff',
      items: [
        { icon: Shield, label: 'Admin Console', page: 'admin', desc: 'User, class and content management' },
      ]
    }] : []),
    {
      title: 'Account',
      items: [
        { icon: Bell, label: 'Notifications', page: 'notifications', desc: 'Manage your notification preferences' },
        { icon: Settings, label: 'Settings', page: 'settings', desc: 'Account and privacy settings' },
      ]
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="More" />

      <div className="max-w-2xl mx-auto px-4 py-4 pb-24 lg:pb-8 space-y-5">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-navy-800 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold">
              {profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-navy-800">{profile?.full_name}</p>
            <p className="text-xs text-slate-500">{profile?.email}</p>
            <span className="text-xs font-semibold text-sapphire-600 capitalize">{profile?.role}</span>
          </div>
          <button className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <ChevronRight size={16} className="text-slate-400" />
          </button>
        </div>

        {sections.map(section => (
          <section key={section.title}>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
              {section.title}
            </h2>
            <div className="space-y-1.5">
              {section.items.map(({ icon: Icon, label, page, desc }) => (
                <button
                  key={page}
                  onClick={() => onNavigate(page)}
                  className="w-full card-hover p-3.5 flex items-center gap-3 text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-navy-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={17} className="text-navy-800" strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy-800">{label}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                  <ChevronRight size={15} className="text-slate-300 flex-shrink-0" />
                </button>
              ))}
            </div>
          </section>
        ))}

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center">
              <span className="text-white font-bold text-xs">FC</span>
            </div>
            <div>
              <p className="text-sm font-bold text-navy-800">Fresh Coast Dance</p>
              <p className="text-xs text-slate-500">Fresh Coast Connect v1.0</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your private studio communication platform. All content is visible to authorized members only.
          </p>
        </div>

        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-red-100 text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} strokeWidth={1.8} />
          <span className="text-sm font-semibold">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
