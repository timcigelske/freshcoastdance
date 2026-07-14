import React, { useEffect, useState } from 'react';
import { Plus, ChevronDown, ChevronUp, MessageCircle, ThumbsUp, CheckCircle, Pin, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Announcement } from '../../lib/types';
import { Header } from '../../components/layout/Header';

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    emergency: { cls: 'badge-emergency', label: 'Emergency' },
    urgent: { cls: 'badge-urgent', label: 'Urgent' },
    important: { cls: 'badge-important', label: 'Important' },
    routine: { cls: 'badge-routine', label: '' },
  };
  const { cls, label } = map[priority] ?? map.routine;
  if (!label) return null;
  return <span className={cls}>{label}</span>;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function AnnouncementCard({
  announcement, currentUserId, isStaff, onAck, onRead
}: {
  announcement: Announcement & { read?: boolean; acknowledged?: boolean; comment_count?: number };
  currentUserId: string;
  isStaff: boolean;
  onAck: (id: string) => void;
  onRead: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(announcement.priority === 'urgent' || announcement.priority === 'emergency');

  function handleExpand() {
    setExpanded(v => !v);
    if (!announcement.read) onRead(announcement.id);
  }

  const borderColor = announcement.priority === 'emergency' ? '#dc2626' :
    announcement.priority === 'urgent' ? '#f97316' :
    announcement.priority === 'important' ? '#d97706' : '#e2e8f0';

  return (
    <div className={`card overflow-hidden ${!announcement.read ? 'ring-1 ring-navy-800/10' : ''}`}
         style={{ borderLeft: `3px solid ${borderColor}` }}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <PriorityBadge priority={announcement.priority} />
              {announcement.is_pinned && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-navy-800">
                  <Pin size={10} />Pinned
                </span>
              )}
              {!announcement.read && (
                <span className="w-2 h-2 bg-sapphire-500 rounded-full" />
              )}
            </div>
            <h3 className="text-sm font-bold text-navy-800 leading-snug mb-0.5">{announcement.title}</h3>
            <p className="text-xs text-slate-500">
              {(announcement as any).author?.full_name} · {timeAgo(announcement.publish_at)}
            </p>
          </div>
          <button onClick={handleExpand} className="p-1 text-slate-400 hover:text-slate-600 flex-shrink-0">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {expanded && (
          <div className="mt-3">
            <div
              className="text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: announcement.body }}
            />

            {announcement.attachment_urls?.length ? (
              <div className="mt-3 space-y-1.5">
                {announcement.attachment_urls.map((url, i) => (
                  <a key={i} href={url}
                     className="flex items-center gap-2 text-xs text-sapphire-600 hover:text-sapphire-700 font-medium">
                    Attachment {i + 1}
                  </a>
                ))}
              </div>
            ) : null}

            {announcement.requires_acknowledgment && !announcement.acknowledged && (
              <button
                onClick={() => onAck(announcement.id)}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-navy-800 hover:bg-navy-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <CheckCircle size={15} />
                Acknowledge — I've read this
              </button>
            )}
            {announcement.requires_acknowledgment && announcement.acknowledged && (
              <div className="mt-3 flex items-center gap-2 py-2 px-3 bg-emerald-50 rounded-xl text-emerald-700 text-xs font-medium">
                <CheckCircle size={14} />
                Acknowledged
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
          <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-sapphire-600 transition-colors">
            <ThumbsUp size={13} />
            Like
          </button>
          {announcement.allow_comments && (
            <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-sapphire-600 transition-colors">
              <MessageCircle size={13} />
              Comment
              {announcement.comment_count ? <span>({announcement.comment_count})</span> : null}
            </button>
          )}
          <span className="ml-auto text-xs text-slate-400">
            {announcement.audience_type === 'all' ? 'All members' :
             announcement.audience_type === 'staff' ? 'Staff only' : 'Selected groups'}
          </span>
        </div>
      </div>
    </div>
  );
}

export function AnnouncementsPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { profile } = useAuth();
  const [announcements, setAnnouncements] = useState<(Announcement & { read?: boolean; acknowledged?: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');
  const [search, setSearch] = useState('');
  const isStaff = profile?.role && ['owner', 'admin', 'teacher'].includes(profile.role);

  useEffect(() => { loadAnnouncements(); }, [profile?.id]);

  async function loadAnnouncements() {
    setLoading(true);
    const { data } = await supabase
      .from('announcements')
      .select('*, author:author_id(full_name, role)')
      .eq('is_published', true)
      .order('is_pinned', { ascending: false })
      .order('publish_at', { ascending: false });

    if (!data) { setLoading(false); return; }

    if (profile?.id) {
      const ids = data.map(a => a.id);
      const [readsRes, acksRes] = await Promise.all([
        supabase.from('announcement_reads').select('announcement_id').eq('user_id', profile.id).in('announcement_id', ids),
        supabase.from('announcement_acknowledgments').select('announcement_id').eq('user_id', profile.id).in('announcement_id', ids)
      ]);
      const readSet = new Set(readsRes.data?.map(r => r.announcement_id) ?? []);
      const ackSet = new Set(acksRes.data?.map(r => r.announcement_id) ?? []);
      setAnnouncements(data.map(a => ({ ...a, read: readSet.has(a.id), acknowledged: ackSet.has(a.id) })));
    } else {
      setAnnouncements(data);
    }
    setLoading(false);
  }

  async function handleRead(announcementId: string) {
    if (!profile?.id) return;
    await supabase.from('announcement_reads').upsert({
      announcement_id: announcementId, user_id: profile.id
    }, { onConflict: 'announcement_id,user_id' });
    setAnnouncements(prev => prev.map(a => a.id === announcementId ? { ...a, read: true } : a));
  }

  async function handleAck(announcementId: string) {
    if (!profile?.id) return;
    await supabase.from('announcement_acknowledgments').insert({
      announcement_id: announcementId, user_id: profile.id
    });
    await handleRead(announcementId);
    setAnnouncements(prev => prev.map(a => a.id === announcementId ? { ...a, acknowledged: true, read: true } : a));
  }

  const filtered = announcements.filter(a => {
    if (filter === 'unread' && a.read) return false;
    if (filter === 'urgent' && !['urgent','emergency'].includes(a.priority)) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const unreadCount = announcements.filter(a => !a.read).length;

  return (
    <div className="flex-1 overflow-y-auto">
      <Header
        title="Announcements"
        notificationCount={unreadCount}
        action={isStaff ? (
          <button className="btn-primary flex items-center gap-1.5">
            <Plus size={15} />New
          </button>
        ) : undefined}
      />

      <div className="max-w-2xl mx-auto px-4 py-4 pb-24 lg:pb-8 space-y-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search announcements..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-800/20 focus:border-navy-800/40"
          />
        </div>

        <div className="flex gap-2">
          {(['all', 'unread', 'urgent'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === f ? 'bg-navy-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-navy-800/30'
              }`}
            >
              {f === 'all' ? `All (${announcements.length})` :
               f === 'unread' ? `Unread (${unreadCount})` : 'Urgent/Emergency'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-navy-800/20 border-t-navy-800 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-slate-500 text-sm">No announcements found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(ann => (
              <AnnouncementCard
                key={ann.id}
                announcement={ann}
                currentUserId={profile?.id ?? ''}
                isStaff={!!isStaff}
                onAck={handleAck}
                onRead={handleRead}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
