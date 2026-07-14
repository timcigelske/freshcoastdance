import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, CheckCircle, X, HelpCircle, AlertTriangle, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Event, Dancer } from '../../lib/types';
import { Header } from '../../components/layout/Header';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
type ViewMode = 'month' | 'week' | 'agenda';

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function EventBadge({ event }: { event: Event }) {
  return (
    <div
      className="text-xs font-medium px-1.5 py-0.5 rounded truncate cursor-pointer"
      style={{ backgroundColor: `${event.color_hex}20`, color: event.color_hex, border: `1px solid ${event.color_hex}30` }}
      title={event.title}
    >
      {event.title}
    </div>
  );
}

function EventDetailModal({ event, dancers, onClose, onRsvp }: {
  event: Event;
  dancers: Dancer[];
  onClose: () => void;
  onRsvp: (eventId: string, dancerId: string, status: string) => void;
}) {
  const start = new Date(event.start_at);
  const end = new Date(event.end_at);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between p-5 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                 style={{ backgroundColor: `${event.color_hex}18` }}>
              <Calendar size={18} style={{ color: event.color_hex }} />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy-800">{event.title}</h2>
              <p className="text-xs text-slate-500 capitalize mt-0.5">{event.event_type}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {event.is_modified && event.modification_note && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 font-medium">{event.modification_note}</p>
            </div>
          )}

          <div className="space-y-2.5">
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <Clock size={15} className="text-slate-400 flex-shrink-0" />
              <div>
                <p className="font-medium">{start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                <p className="text-slate-500">{formatTime(event.start_at)} – {formatTime(event.end_at)}</p>
              </div>
            </div>

            {(event.location || event.room) && (
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <MapPin size={15} className="text-slate-400 flex-shrink-0" />
                <span>{event.room ? `${event.room}${event.location ? ', ' + event.location : ''}` : event.location}</span>
              </div>
            )}

            {event.arrival_time && (
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <Clock size={15} className="text-amber-500 flex-shrink-0" />
                <span>Arrive by {formatTime(event.arrival_time)}</span>
              </div>
            )}

            {event.dress_code && (
              <div className="text-sm text-slate-700">
                <p className="font-medium text-slate-800 mb-0.5">Dress code</p>
                <p className="text-slate-600">{event.dress_code}</p>
              </div>
            )}

            {event.what_to_bring && (
              <div className="text-sm text-slate-700">
                <p className="font-medium text-slate-800 mb-0.5">Bring</p>
                <p className="text-slate-600">{event.what_to_bring}</p>
              </div>
            )}

            {event.description && (
              <div className="text-sm text-slate-700">
                <p className="font-medium text-slate-800 mb-0.5">Details</p>
                <p className="text-slate-600">{event.description}</p>
              </div>
            )}
          </div>

          {event.requires_rsvp && dancers.length > 0 && (
            <div className="border-t border-slate-100 pt-4">
              <p className="text-sm font-bold text-navy-800 mb-3">RSVP for your dancers</p>
              {dancers.map(dancer => (
                <div key={dancer.id} className="flex items-center justify-between gap-2 py-2.5 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-navy-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-navy-800">{dancer.first_name[0]}</span>
                    </div>
                    <span className="text-sm font-medium text-slate-700">{dancer.first_name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[
                      { s: 'going', icon: CheckCircle, cls: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Going' },
                      { s: 'not_going', icon: X, cls: 'text-red-600', bg: 'bg-red-50', label: 'Can\'t' },
                      { s: 'unsure', icon: HelpCircle, cls: 'text-amber-600', bg: 'bg-amber-50', label: 'Unsure' },
                    ].map(({ s, icon: Icon, cls, bg, label }) => (
                      <button
                        key={s}
                        onClick={() => onRsvp(event.id, dancer.id, s)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium ${bg} ${cls} hover:opacity-80 transition-opacity`}
                      >
                        <Icon size={12} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CalendarPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { profile } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [dancers, setDancers] = useState<Dancer[]>([]);
  const [loading, setLoading] = useState(true);
  const isStaff = profile?.role && ['owner', 'admin', 'teacher'].includes(profile.role);

  useEffect(() => { loadEvents(); }, [currentDate, viewMode]);
  useEffect(() => {
    if (profile?.household_id) {
      supabase.from('dancers').select('*').eq('household_id', profile.household_id).eq('is_active', true)
        .then(({ data }) => setDancers(data ?? []));
    }
  }, [profile?.household_id]);

  async function loadEvents() {
    setLoading(true);
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 31);
    const { data } = await supabase.from('events')
      .select('*')
      .gte('start_at', start.toISOString())
      .lte('start_at', end.toISOString())
      .eq('is_cancelled', false)
      .order('start_at');
    setEvents(data ?? []);
    setLoading(false);
  }

  async function handleRsvp(eventId: string, dancerId: string, status: string) {
    await supabase.from('attendance_responses').upsert({
      event_id: eventId, dancer_id: dancerId, user_id: profile?.id,
      rsvp_status: status, rsvp_at: new Date().toISOString()
    }, { onConflict: 'event_id,dancer_id' });
  }

  function prevMonth() { setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)); }
  function nextMonth() { setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)); }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  function eventsOnDay(day: number) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.start_at.startsWith(date));
  }

  const agendaEvents = events.filter(e => new Date(e.start_at) >= new Date(today.toDateString()));

  return (
    <div className="flex-1 overflow-y-auto">
      <Header
        title="Calendar"
        action={isStaff ? (
          <button className="btn-primary flex items-center gap-1.5">
            <Plus size={15} />Add
          </button>
        ) : undefined}
      />

      <div className="max-w-2xl mx-auto px-4 py-4 pb-24 lg:pb-8">
        {/* View toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            {(['month', 'week', 'agenda'] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                  viewMode === v ? 'bg-white text-navy-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <ChevronLeft size={18} className="text-slate-600" />
            </button>
            <span className="text-sm font-bold text-navy-800 min-w-[120px] text-center">
              {MONTHS[month]} {year}
            </span>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <ChevronRight size={18} className="text-slate-600" />
            </button>
          </div>
        </div>

        {viewMode === 'month' && (
          <div className="card overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-slate-100">
              {DAYS.map(d => (
                <div key={d} className="text-center py-2 text-xs font-semibold text-slate-400">{d}</div>
              ))}
            </div>
            {/* Days grid */}
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="border-b border-r border-slate-50 p-1 min-h-[70px]" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = eventsOnDay(day);
                const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
                return (
                  <div key={day} className="border-b border-r border-slate-50 p-1 min-h-[70px]">
                    <div className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold mb-0.5 ${
                      isToday ? 'bg-navy-800 text-white' : 'text-slate-700'
                    }`}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map(event => (
                        <button key={event.id} onClick={() => setSelectedEvent(event)} className="w-full text-left">
                          <EventBadge event={event} />
                        </button>
                      ))}
                      {dayEvents.length > 2 && (
                        <p className="text-xs text-slate-400 pl-1">+{dayEvents.length - 2}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'agenda' && (
          <div className="space-y-2">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-navy-800/20 border-t-navy-800 rounded-full animate-spin" />
              </div>
            ) : agendaEvents.length === 0 ? (
              <div className="card p-10 text-center">
                <Calendar size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 text-sm">No upcoming events</p>
              </div>
            ) : (
              agendaEvents.map(event => {
                const start = new Date(event.start_at);
                return (
                  <div
                    key={event.id}
                    className="card-hover p-4 flex items-start gap-3 cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex flex-col items-center w-12 flex-shrink-0">
                      <p className="text-xs font-semibold text-slate-400 uppercase">{DAYS[start.getDay()]}</p>
                      <p className="text-xl font-bold text-navy-800 leading-none">{start.getDate()}</p>
                    </div>
                    <div className="w-1 h-full min-h-[40px] rounded-full flex-shrink-0" style={{ backgroundColor: event.color_hex }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy-800">{event.title}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock size={10} />
                          {formatTime(event.start_at)} – {formatTime(event.end_at)}
                        </span>
                        {event.room && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin size={10} />
                            {event.room}
                          </span>
                        )}
                      </div>
                      {event.is_modified && (
                        <div className="mt-1 text-xs text-amber-700 flex items-center gap-1">
                          <AlertTriangle size={10} />
                          {event.modification_note}
                        </div>
                      )}
                    </div>
                    {event.requires_rsvp && (
                      <span className="text-xs text-sapphire-600 bg-sapphire-50 px-2 py-0.5 rounded-full font-medium flex-shrink-0">RSVP</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {viewMode === 'week' && (
          <div className="card p-4 text-center text-sm text-slate-500">
            <Calendar size={28} className="mx-auto text-slate-300 mb-2" />
            Week view coming soon — use Agenda view for a chronological list
          </div>
        )}
      </div>

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          dancers={dancers}
          onClose={() => setSelectedEvent(null)}
          onRsvp={handleRsvp}
        />
      )}
    </div>
  );
}
