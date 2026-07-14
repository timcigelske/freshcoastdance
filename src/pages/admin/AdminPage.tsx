import React, { useEffect, useState } from 'react';
import {
  Users, UserCheck, BookOpen, Home, BarChart2, Settings,
  ChevronRight, Shield, Eye, Download, Plus, Edit
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Header } from '../../components/layout/Header';

interface AdminStats {
  totalDancers: number;
  totalHouseholds: number;
  totalStaff: number;
  totalClasses: number;
  totalAnnouncements: number;
  totalTasks: number;
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-xl font-bold text-navy-800">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

type AdminTab = 'overview' | 'users' | 'classes' | 'households';

export function AdminPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { profile } = useAuth();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<AdminStats>({ totalDancers: 0, totalHouseholds: 0, totalStaff: 0, totalClasses: 0, totalAnnouncements: 0, totalTasks: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [households, setHouseholds] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [tab]);

  async function loadData() {
    setLoading(true);
    if (tab === 'overview') {
      const [d, h, s, c, a, t] = await Promise.all([
        supabase.from('dancers').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('households').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('staff').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('classes').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('announcements').select('id', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('is_active', true),
      ]);
      setStats({
        totalDancers: d.count ?? 0, totalHouseholds: h.count ?? 0,
        totalStaff: s.count ?? 0, totalClasses: c.count ?? 0,
        totalAnnouncements: a.count ?? 0, totalTasks: t.count ?? 0
      });
    } else if (tab === 'users') {
      const { data } = await supabase.from('profiles').select('*').order('full_name');
      setUsers(data ?? []);
    } else if (tab === 'households') {
      const { data } = await supabase.from('households')
        .select('*, dancers(id, first_name, last_name)')
        .eq('is_active', true)
        .order('name');
      setHouseholds(data ?? []);
    } else if (tab === 'classes') {
      const { data } = await supabase.from('classes')
        .select('*, teacher:teacher_id(id, profile:user_id(full_name)), program:program_id(name, color_hex)')
        .eq('is_active', true)
        .order('name');
      setClasses(data ?? []);
    }
    setLoading(false);
  }

  const tabs: { id: AdminTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'households', label: 'Families', icon: Home },
    { id: 'classes', label: 'Classes', icon: BookOpen },
  ];

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Admin Console" subtitle="Studio management" />

      <div className="max-w-3xl mx-auto px-4 py-4 pb-24 lg:pb-8 space-y-4">
        {/* Role badge */}
        <div className="flex items-center gap-2 px-3 py-2 bg-navy-50 rounded-xl">
          <Shield size={15} className="text-navy-800" />
          <span className="text-sm font-semibold text-navy-800 capitalize">{profile?.role} access</span>
          <span className="ml-auto text-xs text-slate-500">{profile?.email}</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                tab === id ? 'bg-white text-navy-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-navy-800/20 border-t-navy-800 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {tab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <StatCard label="Active Dancers" value={stats.totalDancers} icon={UserCheck} color="bg-navy-800" />
                  <StatCard label="Households" value={stats.totalHouseholds} icon={Home} color="bg-sapphire-500" />
                  <StatCard label="Staff" value={stats.totalStaff} icon={Users} color="bg-teal-600" />
                  <StatCard label="Classes" value={stats.totalClasses} icon={BookOpen} color="bg-violet-600" />
                  <StatCard label="Announcements" value={stats.totalAnnouncements} icon={BarChart2} color="bg-amber-500" />
                  <StatCard label="Active Tasks" value={stats.totalTasks} icon={Shield} color="bg-red-500" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-sm font-bold text-navy-800">Quick Actions</h2>
                  {[
                    { label: 'Create Announcement', desc: 'Send message to all members', onClick: () => onNavigate('announcements'), icon: Plus },
                    { label: 'Add Event', desc: 'Create calendar event', onClick: () => onNavigate('calendar'), icon: Plus },
                    { label: 'Create Task', desc: 'Assign action to families', onClick: () => onNavigate('tasks'), icon: Plus },
                    { label: 'Upload File', desc: 'Add to file library', onClick: () => onNavigate('files'), icon: Plus },
                  ].map(({ label, desc, onClick, icon: Icon }) => (
                    <button key={label} onClick={onClick} className="w-full card-hover p-3.5 flex items-center gap-3 text-left">
                      <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
                        <Icon size={15} className="text-navy-800" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-navy-800">{label}</p>
                        <p className="text-xs text-slate-500">{desc}</p>
                      </div>
                      <ChevronRight size={15} className="text-slate-300" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tab === 'users' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-slate-500">{users.length} users total</p>
                  <button className="btn-outline flex items-center gap-1.5 text-xs">
                    <Download size={13} />Export CSV
                  </button>
                </div>
                {users.map(u => (
                  <div key={u.id} className="card p-3.5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-navy-800 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {u.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy-800 truncate">{u.full_name}</p>
                      <p className="text-xs text-slate-500 truncate">{u.email}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${
                      u.role === 'owner' ? 'bg-navy-800 text-white' :
                      u.role === 'admin' ? 'bg-sapphire-500 text-white' :
                      u.role === 'teacher' ? 'bg-teal-600 text-white' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {tab === 'households' && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">{households.length} households</p>
                {households.map((h: any) => (
                  <div key={h.id} className="card p-3.5 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Home size={16} className="text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy-800">{h.name}</p>
                      <p className="text-xs text-slate-500">
                        {h.dancers?.length ?? 0} dancer{h.dancers?.length !== 1 ? 's' : ''}
                        {h.dancers?.length > 0 && ` · ${h.dancers.map((d: any) => d.first_name).join(', ')}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'classes' && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">{classes.length} active classes</p>
                {classes.map((c: any) => (
                  <div key={c.id} className="card p-3.5 flex items-start gap-3">
                    <div
                      className="w-2.5 h-10 rounded-full flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: c.color_hex }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy-800">{c.name}</p>
                      <p className="text-xs text-slate-500">
                        {c.teacher?.profile?.full_name ?? 'No teacher assigned'}
                        {c.day_of_week != null && ` · ${DAYS[c.day_of_week]}`}
                        {c.start_time && ` ${c.start_time.slice(0,5)}–${c.end_time?.slice(0,5)}`}
                        {c.room && ` · ${c.room}`}
                      </p>
                    </div>
                    {c.program && (
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full text-white flex-shrink-0"
                        style={{ backgroundColor: c.program.color_hex }}
                      >
                        {c.program.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
