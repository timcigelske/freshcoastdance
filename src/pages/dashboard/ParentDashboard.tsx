import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, AlertTriangle, ChevronRight, Calendar, FileText, CheckSquare, User, Users, MapPin, AlertCircle, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Announcement, Event, Task, Dancer, Enrollment } from '../../lib/types';
import { Header } from '../../components/layout/Header';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatTime(timeStr: string | null) {
  if (!timeStr) return '';
  const d = new Date(timeStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDue(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((d.getTime() - now.getTime()) / 86400000);
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  if (diff < 0) return 'Overdue';
  return `Due ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

function PriorityBadge({ priority }: { priority: string }) {
  if (priority === 'urgent') return <span className="badge-urgent"><AlertTriangle size={10} />Urgent</span>;
  if (priority === 'emergency') return <span className="badge-emergency"><AlertCircle size={10} />Emergency</span>;
  if (priority === 'important') return <span className="badge-important"><Star size={10} />Important</span>;
  return null;
}

function AttendanceBadge({ status }: { status: string | null }) {
  if (status === 'going') return <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700"><CheckCircle size={10} />Going</span>;
  if (status === 'not_going') return <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700">Not going</span>;
  if (status === 'unsure') return <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Unsure</span>;
  if (status === 'late') return <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">Arriving late</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">No response</span>;
}

interface DashboardData {
  urgentAnnouncements: Announcement[];
  todayEvents: Event[];
  weekEvents: Event[];
  pendingTasks: Task[];
  dancers: (Dancer & { enrollments?: Enrollment[] })[];
}

export function ParentDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { profile } = useAuth();
  const [data, setData] = useState<DashboardData>({
    urgentAnnouncements: [], todayEvents: [], weekEvents: [],
    pendingTasks: [], dancers: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedDancer, setSelectedDancer] = useState<string>('all');
  const [rsvpLoading, setRsvpLoading] = useState<string>('');

  const householdId = profile?.household_id;

  useEffect(() => {
    if (!profile?.id) return;
    loadDashboard();
  }, [profile?.id, householdId]);

  async function loadDashboard() {
    setLoading(true);
    try {
      const now = new Date();
      const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
      const todayEnd = new Date(now); todayEnd.setHours(23,59,59,999);
      const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + 7);

      const [annRes, evtRes, taskRes, dancersRes] = await Promise.all([
        supabase.from('announcements')
          .select('*, author:author_id(full_name, role)')
          .eq('is_published', true)
          .in('priority', ['urgent','emergency','important'])
          .order('publish_at', { ascending: false })
          .limit(6),
        supabase.from('events')
          .select(`*, teacher:teacher_id(id, title, profile:user_id(full_name))`)
          .gte('start_at', todayStart.toISOString())
          .lte('start_at', weekEnd.toISOString())
          .eq('is_cancelled', false)
          .order('start_at', { ascending: true }),
        supabase.from('tasks')
          .select('*')
          .eq('is_active', true)
          .order('due_at', { ascending: true })
          .limit(5),
        householdId
          ? supabase.from('dancers')
              .select('*, enrollments:enrollments(*, class:class_id(*, teacher:teacher_id(id, title, profile:user_id(full_name))))')
              .eq('household_id', householdId)
              .eq('is_active', true)
          : { data: [], error: null }
      ]);

      const today = evtRes.data?.filter(e => {
        const d = new Date(e.start_at);
        return d >= todayStart && d <= todayEnd;
      }) ?? [];
      const week = evtRes.data?.filter(e => {
        const d = new Date(e.start_at);
        return d > todayEnd;
      }) ?? [];

      // Fetch read status for announcements
      let announcementsWithRead = annRes.data ?? [];
      if (annRes.data?.length && profile?.id) {
        const ids = annRes.data.map(a => a.id);
        const { data: reads } = await supabase.from('announcement_reads')
          .select('announcement_id')
          .eq('user_id', profile.id)
          .in('announcement_id', ids);
        const readSet = new Set(reads?.map(r => r.announcement_id) ?? []);
        announcementsWithRead = annRes.data.map(a => ({ ...a, read: readSet.has(a.id) }));
      }

      setData({
        urgentAnnouncements: announcementsWithRead.filter((a: Announcement & { read?: boolean }) => !a.read || a.priority === 'urgent' || a.priority === 'emergency').slice(0, 4),
        todayEvents: today,
        weekEvents: week,
        pendingTasks: taskRes.data ?? [],
        dancers: dancersRes.data ?? []
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleRsvp(eventId: string, dancerId: string, status: string) {
    setRsvpLoading(`${eventId}-${dancerId}`);
    await supabase.from('attendance_responses').upsert({
      event_id: eventId,
      dancer_id: dancerId,
      user_id: profile?.id,
      rsvp_status: status,
      rsvp_at: new Date().toISOString()
    }, { onConflict: 'event_id,dancer_id' });
    setRsvpLoading('');
    await loadDashboard();
  }

  const householdName = profile?.household_id
    ? (data.dancers[0]?.household as any)?.name ?? 'My Family'
    : profile?.full_name;

  const filteredDancers = selectedDancer === 'all'
    ? data.dancers
    : data.dancers.filter(d => d.id === selectedDancer);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-navy-800/20 border-t-navy-800 rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <Header
        title="Fresh Coast Connect"
        subtitle={householdName ?? undefined}
        notificationCount={data.urgentAnnouncements.filter(a => !a.read).length}
        onNotifications={() => onNavigate('notifications')}
      />

      <div className="max-w-2xl mx-auto px-4 py-4 pb-24 lg:pb-8 space-y-5">

        {/* Dancer filter */}
        {data.dancers.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedDancer('all')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedDancer === 'all'
                  ? 'bg-navy-800 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-navy-800/30'
              }`}
            >
              All Dancers
            </button>
            {data.dancers.map(d => (
              <button
                key={d.id}
                onClick={() => setSelectedDancer(d.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedDancer === d.id
                    ? 'bg-navy-800 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-navy-800/30'
                }`}
              >
                {d.first_name}
              </button>
            ))}
          </div>
        )}

        {/* Needs Attention */}
        {(data.urgentAnnouncements.length > 0 || data.pendingTasks.length > 0) && (
          <section>
            <h2 className="text-sm font-bold text-navy-800 flex items-center gap-2 mb-3">
              <AlertTriangle size={15} className="text-amber-500" />
              Needs Your Attention
            </h2>
            <div className="space-y-2">
              {data.urgentAnnouncements.filter(a => a.priority === 'urgent' || a.priority === 'emergency').map(ann => (
                <div
                  key={ann.id}
                  className="card p-4 border-l-4 border-l-red-500 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onNavigate('announcements')}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <PriorityBadge priority={ann.priority} />
                        {!ann.read && <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
                      </div>
                      <p className="text-sm font-semibold text-navy-800 leading-snug">{ann.title}</p>
                      {ann.requires_acknowledgment && (
                        <button
                          onClick={e => { e.stopPropagation(); onNavigate('announcements'); }}
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <CheckCircle size={12} />
                          Acknowledge
                        </button>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
                  </div>
                </div>
              ))}

              {data.pendingTasks.slice(0, 3).map(task => (
                <div
                  key={task.id}
                  className="card p-4 border-l-4 border-l-amber-400 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onNavigate('tasks')}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge-important"><CheckSquare size={10} />Task</span>
                        {task.due_at && (
                          <span className="text-xs text-slate-500">{formatDue(task.due_at)}</span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-navy-800 leading-snug">{task.title}</p>
                      <button
                        onClick={e => { e.stopPropagation(); onNavigate('tasks'); }}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-navy-800 bg-navy-50 hover:bg-navy-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Review and complete
                      </button>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Today's Schedule */}
        <section>
          <h2 className="text-sm font-bold text-navy-800 flex items-center gap-2 mb-3">
            <Calendar size={15} className="text-sapphire-500" />
            Today
            <span className="text-xs font-normal text-slate-400 ml-auto">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </h2>

          {data.todayEvents.length === 0 ? (
            <div className="card p-6 text-center">
              <Calendar size={28} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">Nothing scheduled for today</p>
              <button onClick={() => onNavigate('calendar')} className="text-xs text-sapphire-500 font-medium mt-1 hover:underline">
                View full calendar
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {data.todayEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  dancers={filteredDancers}
                  onRsvp={handleRsvp}
                  rsvpLoading={rsvpLoading}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          )}
        </section>

        {/* Upcoming This Week */}
        {data.weekEvents.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-navy-800 flex items-center gap-2">
                <Clock size={15} className="text-slate-400" />
                Upcoming This Week
              </h2>
              <button onClick={() => onNavigate('calendar')} className="text-xs text-sapphire-500 font-medium hover:underline flex items-center gap-1">
                View all <ChevronRight size={12} />
              </button>
            </div>
            <div className="space-y-2">
              {data.weekEvents.slice(0, 5).map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  dancers={filteredDancers}
                  onRsvp={handleRsvp}
                  rsvpLoading={rsvpLoading}
                  onNavigate={onNavigate}
                  compact
                />
              ))}
            </div>
          </section>
        )}

        {/* Recent Announcements */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-navy-800">Recent Announcements</h2>
            <button onClick={() => onNavigate('announcements')} className="text-xs text-sapphire-500 font-medium hover:underline flex items-center gap-1">
              See all <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {data.urgentAnnouncements.length === 0 ? (
              <div className="card p-5 text-center text-sm text-slate-500">No recent announcements</div>
            ) : (
              data.urgentAnnouncements.slice(0, 4).map(ann => (
                <div
                  key={ann.id}
                  className="card-hover p-4 cursor-pointer"
                  onClick={() => onNavigate('announcements')}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      ann.priority === 'urgent' || ann.priority === 'emergency' ? 'bg-red-50' :
                      ann.priority === 'important' ? 'bg-amber-50' : 'bg-slate-100'
                    }`}>
                      <span className={`text-xs font-bold ${
                        ann.priority === 'urgent' || ann.priority === 'emergency' ? 'text-red-600' :
                        ann.priority === 'important' ? 'text-amber-600' : 'text-slate-500'
                      }`}>
                        {ann.priority === 'urgent' || ann.priority === 'emergency' ? '!' : 'i'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {!ann.read && <span className="w-1.5 h-1.5 bg-sapphire-500 rounded-full flex-shrink-0" />}
                        <PriorityBadge priority={ann.priority} />
                      </div>
                      <p className="text-sm font-semibold text-navy-800 leading-snug">{ann.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {(ann as any).author?.full_name} · {formatDate(ann.publish_at)}
                      </p>
                    </div>
                    <ChevronRight size={15} className="text-slate-300 flex-shrink-0 mt-1" />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* My Dancers */}
        {data.dancers.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-navy-800 flex items-center gap-2 mb-3">
              <User size={15} />
              My Dancers
            </h2>
            <div className="space-y-3">
              {filteredDancers.map(dancer => (
                <DancerCard key={dancer.id} dancer={dancer} onNavigate={onNavigate} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function EventCard({ event, dancers, onRsvp, rsvpLoading, onNavigate, compact = false }: {
  event: Event;
  dancers: any[];
  onRsvp: (eventId: string, dancerId: string, status: string) => void;
  rsvpLoading: string;
  onNavigate: (page: string) => void;
  compact?: boolean;
}) {
  const startDate = new Date(event.start_at);
  const endDate = new Date(event.end_at);

  return (
    <div className={`card p-4 ${event.is_modified ? 'border-l-4 border-l-amber-400' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
             style={{ backgroundColor: `${event.color_hex}18`, border: `1.5px solid ${event.color_hex}30` }}>
          <Calendar size={16} style={{ color: event.color_hex }} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-navy-800 leading-snug">{event.title}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock size={10} />
                  {!compact && formatDate(event.start_at) + ' · '}
                  {formatTime(event.start_at)} – {formatTime(event.end_at)}
                </span>
                {event.room && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin size={10} />
                    {event.room}
                  </span>
                )}
              </div>
            </div>
            {compact && (
              <div className="flex-shrink-0 text-right">
                <p className="text-xs font-medium text-slate-500">
                  {DAY_NAMES[startDate.getDay()]}
                </p>
                <p className="text-sm font-bold text-navy-800">{startDate.getDate()}</p>
              </div>
            )}
          </div>

          {event.is_modified && event.modification_note && (
            <div className="mt-2 flex items-start gap-1.5 p-2 bg-amber-50 rounded-lg">
              <AlertTriangle size={12} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 font-medium">{event.modification_note}</p>
            </div>
          )}

          {!compact && event.requires_rsvp && dancers.length > 0 && (
            <div className="mt-3 space-y-2">
              {dancers.map(dancer => {
                const rsvp = event.attendance_responses?.find(r => r.dancer_id === dancer.id);
                const key = `${event.id}-${dancer.id}`;
                const isLoading = rsvpLoading === key;
                return (
                  <div key={dancer.id} className="flex items-center justify-between gap-2 py-1.5 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-navy-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-navy-800">{dancer.first_name[0]}</span>
                      </div>
                      <span className="text-xs font-medium text-slate-700">{dancer.first_name}</span>
                      <AttendanceBadge status={rsvp?.rsvp_status ?? null} />
                    </div>
                    {!rsvp?.rsvp_status && (
                      <div className="flex items-center gap-1">
                        {['going','not_going','unsure'].map(s => (
                          <button
                            key={s}
                            disabled={isLoading}
                            onClick={() => onRsvp(event.id, dancer.id, s)}
                            className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-all disabled:opacity-50 ${
                              s === 'going' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' :
                              s === 'not_going' ? 'bg-red-50 text-red-700 hover:bg-red-100' :
                              'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            }`}
                          >
                            {s === 'going' ? 'Going' : s === 'not_going' ? 'Can\'t' : 'Unsure'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {event.what_to_bring && !compact && (
            <p className="text-xs text-slate-500 mt-2 flex items-start gap-1">
              <span className="font-medium">Bring:</span> {event.what_to_bring}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function DancerCard({ dancer, onNavigate }: { dancer: Dancer & { enrollments?: Enrollment[] }; onNavigate: (page: string) => void }) {
  const classes = dancer.enrollments?.filter(e => e.is_active).map(e => e.class) ?? [];

  return (
    <div className="card-hover p-4 cursor-pointer" onClick={() => onNavigate('calendar')}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">{dancer.first_name[0]}{dancer.last_name[0]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-navy-800">{dancer.first_name} {dancer.last_name}</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {classes.slice(0, 4).map(cls => cls && (
              <span
                key={cls.id}
                className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: cls.color_hex }}
              >
                {cls.name}
              </span>
            ))}
            {classes.length > 4 && (
              <span className="text-xs text-slate-500">+{classes.length - 4} more</span>
            )}
          </div>
        </div>
        <ChevronRight size={16} className="text-slate-300 mt-0.5 flex-shrink-0" />
      </div>
    </div>
  );
}
