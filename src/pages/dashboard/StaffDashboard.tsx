import React, { useEffect, useState } from 'react';
import {
  AlertTriangle, Calendar, Users, Clock, FileText,
  CheckSquare, Send, Plus, ChevronRight, Star, Bell,
  BookOpen, User, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Header } from '../../components/layout/Header';

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function StaffDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { profile } = useAuth();
  const [data, setData] = useState<any>({
    todayEvents: [], upcomingEvents: [], recentAnnouncements: [],
    pendingTasks: [], unreadMessages: 0, stats: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const now = new Date();
      const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
      const todayEnd = new Date(now); todayEnd.setHours(23,59,59,999);
      const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + 7);

      const [evtToday, evtWeek, annRes, taskRes, dancerCount, householdCount] = await Promise.all([
        supabase.from('events')
          .select(`*, teacher:teacher_id(id, title, profile:user_id(full_name))`)
          .gte('start_at', todayStart.toISOString())
          .lte('start_at', todayEnd.toISOString())
          .eq('is_cancelled', false)
          .order('start_at'),
        supabase.from('events')
          .select(`*, teacher:teacher_id(id, title, profile:user_id(full_name))`)
          .gt('start_at', todayEnd.toISOString())
          .lte('start_at', weekEnd.toISOString())
          .eq('is_cancelled', false)
          .order('start_at')
          .limit(6),
        supabase.from('announcements')
          .select('*, author:author_id(full_name)')
          .eq('is_published', true)
          .order('publish_at', { ascending: false })
          .limit(5),
        supabase.from('tasks')
          .select(`*, completions:task_completions(id)`)
          .eq('is_active', true)
          .order('due_at')
          .limit(5),
        supabase.from('dancers').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('households').select('id', { count: 'exact', head: true }).eq('is_active', true),
      ]);

      setData({
        todayEvents: evtToday.data ?? [],
        upcomingEvents: evtWeek.data ?? [],
        recentAnnouncements: annRes.data ?? [],
        pendingTasks: taskRes.data ?? [],
        stats: {
          dancers: dancerCount.count ?? 0,
          households: householdCount.count ?? 0,
        }
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-navy-800/20 border-t-navy-800 rounded-full animate-spin" />
      </div>
    );
  }

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="flex-1 overflow-y-auto">
      <Header
        title="Staff Dashboard"
        subtitle={`${greeting}, ${profile?.full_name?.split(' ')[0]}`}
        notificationCount={3}
        onNotifications={() => onNavigate('notifications')}
      />

      <div className="max-w-3xl mx-auto px-4 py-4 pb-24 lg:pb-8 space-y-5">

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Plus, label: 'Announcement', color: 'bg-navy-800', onClick: () => onNavigate('announcements') },
            { icon: Calendar, label: 'Add Event', color: 'bg-sapphire-500', onClick: () => onNavigate('calendar') },
            { icon: FileText, label: 'Upload File', color: 'bg-teal-600', onClick: () => onNavigate('files') },
            { icon: CheckSquare, label: 'Create Task', color: 'bg-amber-500', onClick: () => onNavigate('tasks') },
            { icon: Send, label: 'Message', color: 'bg-indigo-500', onClick: () => onNavigate('messages') },
            { icon: Users, label: 'Groups', color: 'bg-purple-600', onClick: () => onNavigate('groups') },
          ].map(({ icon: Icon, label, color, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="card-hover p-3 flex flex-col items-center gap-2 text-center group"
            >
              <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                <Icon size={16} className="text-white" />
              </div>
              <span className="text-xs font-medium text-slate-600">{label}</span>
            </button>
          ))}
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Active Dancers', value: data.stats.dancers, icon: User, color: 'text-navy-800' },
            { label: 'Families', value: data.stats.households, icon: Users, color: 'text-sapphire-500' },
            { label: 'Open Tasks', value: data.pendingTasks.length, icon: CheckSquare, color: 'text-amber-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-3 text-center">
              <Icon size={18} className={`mx-auto mb-1 ${color}`} />
              <p className="text-xl font-bold text-navy-800">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Today's Schedule */}
        <section>
          <h2 className="text-sm font-bold text-navy-800 flex items-center gap-2 mb-3">
            <Calendar size={15} className="text-sapphire-500" />
            Today's Classes & Events
            <span className="text-xs font-normal text-slate-400 ml-auto">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </h2>

          {data.todayEvents.length === 0 ? (
            <div className="card p-5 text-center">
              <p className="text-sm text-slate-500">No classes or events scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.todayEvents.map((event: any) => (
                <div key={event.id} className="card p-4" onClick={() => onNavigate('calendar')} style={{cursor:'pointer'}}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                         style={{ backgroundColor: `${event.color_hex}18`, border: `1.5px solid ${event.color_hex}30` }}>
                      <BookOpen size={16} style={{ color: event.color_hex }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy-800">{event.title}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock size={10} />
                          {formatTime(event.start_at)} – {formatTime(event.end_at)}
                        </span>
                        {event.room && <span className="text-xs text-slate-500">{event.room}</span>}
                        {event.teacher?.profile?.full_name && (
                          <span className="text-xs text-slate-500">{event.teacher.profile.full_name}</span>
                        )}
                      </div>
                      {event.is_modified && event.modification_note && (
                        <div className="mt-1.5 flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">
                          <AlertTriangle size={10} />
                          {event.modification_note}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {event.requires_rsvp && (
                        <span className="text-xs text-sapphire-600 font-medium bg-sapphire-50 px-2 py-0.5 rounded-full">RSVP</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Upcoming This Week */}
        {data.upcomingEvents.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-navy-800 flex items-center gap-2">
                <Clock size={15} className="text-slate-400" />
                Coming Up This Week
              </h2>
              <button onClick={() => onNavigate('calendar')} className="text-xs text-sapphire-500 font-medium hover:underline flex items-center gap-1">
                View calendar <ChevronRight size={12} />
              </button>
            </div>
            <div className="space-y-1.5">
              {data.upcomingEvents.map((event: any) => (
                <div key={event.id} className="card-hover p-3 flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('calendar')}>
                  <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: event.color_hex }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-800 truncate">{event.title}</p>
                    <p className="text-xs text-slate-500">{formatDate(event.start_at)} · {formatTime(event.start_at)}</p>
                  </div>
                  {event.requires_rsvp && (
                    <span className="text-xs text-sapphire-600 font-medium bg-sapphire-50 px-2 py-0.5 rounded-full flex-shrink-0">RSVP</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Announcements */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-navy-800">Recent Announcements</h2>
            <button onClick={() => onNavigate('announcements')} className="text-xs text-sapphire-500 font-medium hover:underline flex items-center gap-1">
              Manage <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {data.recentAnnouncements.map((ann: any) => (
              <div key={ann.id} className="card-hover p-3.5 flex items-start gap-3 cursor-pointer" onClick={() => onNavigate('announcements')}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                  ann.priority === 'urgent' || ann.priority === 'emergency' ? 'bg-red-500' :
                  ann.priority === 'important' ? 'bg-amber-500' : 'bg-slate-300'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-navy-800 truncate">{ann.title}</p>
                  <p className="text-xs text-slate-500">
                    {ann.author?.full_name} · {formatDate(ann.publish_at)}
                    {ann.requires_acknowledgment && <span className="ml-2 text-amber-600 font-medium">Ack required</span>}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 capitalize ${
                  ann.priority === 'urgent' || ann.priority === 'emergency' ? 'bg-red-50 text-red-700' :
                  ann.priority === 'important' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {ann.priority}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Open Tasks */}
        {data.pendingTasks.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-navy-800 flex items-center gap-2">
                <CheckSquare size={15} className="text-amber-500" />
                Open Tasks
              </h2>
              <button onClick={() => onNavigate('tasks')} className="text-xs text-sapphire-500 font-medium hover:underline flex items-center gap-1">
                Manage <ChevronRight size={12} />
              </button>
            </div>
            <div className="space-y-2">
              {data.pendingTasks.map((task: any) => (
                <div key={task.id} className="card-hover p-3.5 flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('tasks')}>
                  <CheckSquare size={16} className="text-amber-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-800 truncate">{task.title}</p>
                    <p className="text-xs text-slate-500">
                      {task.completions?.length ?? 0} completed
                      {task.due_at && ` · Due ${new Date(task.due_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
