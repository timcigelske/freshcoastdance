import React, { useEffect, useState, useRef } from 'react';
import { Send, Search, MessageCircle, Plus, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Conversation, Message } from '../../lib/types';
import { Header } from '../../components/layout/Header';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ConvTitle(conv: Conversation & { participants?: any[] }, currentUserId: string) {
  if (conv.title) return conv.title;
  if (conv.type === 'direct') {
    const other = conv.participants?.find((p: any) => p.user_id !== currentUserId);
    return other?.profile?.full_name ?? 'Direct Message';
  }
  return 'Conversation';
}

function ConvAvatar({ title, color = '#1E3A5F' }: { title: string; color?: string }) {
  const initials = title.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

function MessageBubble({ message, isOwn }: { message: Message & { sender?: any }; isOwn: boolean }) {
  return (
    <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isOwn && (
        <div className="w-7 h-7 rounded-full bg-navy-100 flex items-center justify-center flex-shrink-0 mb-1">
          <span className="text-xs font-bold text-navy-800">
            {message.sender?.full_name?.[0] ?? '?'}
          </span>
        </div>
      )}
      <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isOwn && (
          <p className="text-xs text-slate-500 font-medium mb-1 ml-1">{message.sender?.full_name}</p>
        )}
        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isOwn
            ? 'bg-navy-800 text-white rounded-br-sm'
            : 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm'
        }`}>
          {message.body}
        </div>
        <p className="text-xs text-slate-400 mt-1 mx-1">{timeAgo(message.created_at)}</p>
      </div>
    </div>
  );
}

export function MessagesPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadConversations(); }, [profile?.id]);
  useEffect(() => {
    if (selectedConv) loadMessages(selectedConv.id);
  }, [selectedConv?.id]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadConversations() {
    if (!profile?.id) return;
    setLoading(true);
    const { data: parts } = await supabase
      .from('conversation_participants')
      .select(`
        conversation:conversation_id(
          id, type, title, last_message_at, is_archived,
          participants:conversation_participants(user_id, profile:user_id(full_name, role))
        )
      `)
      .eq('user_id', profile.id);

    const convs = parts?.map(p => p.conversation).filter(Boolean) ?? [];
    // Sort by last_message_at
    convs.sort((a: any, b: any) =>
      new Date(b.last_message_at ?? 0).getTime() - new Date(a.last_message_at ?? 0).getTime()
    );
    setConversations(convs);
    setLoading(false);
  }

  async function loadMessages(convId: string) {
    const { data } = await supabase
      .from('messages')
      .select('*, sender:sender_id(full_name, role)')
      .eq('conversation_id', convId)
      .eq('is_deleted', false)
      .order('created_at');
    setMessages(data ?? []);
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv || !profile?.id || sending) return;
    setSending(true);
    const { data: msg } = await supabase.from('messages').insert({
      conversation_id: selectedConv.id,
      sender_id: profile.id,
      body: newMessage.trim()
    }).select('*, sender:sender_id(full_name, role)').maybeSingle();

    if (msg) {
      setMessages(prev => [...prev, msg]);
      await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', selectedConv.id);
    }
    setNewMessage('');
    setSending(false);
  }

  if (selectedConv) {
    const convTitle = ConvTitle(selectedConv, profile?.id ?? '');
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={convTitle} onBack={() => setSelectedConv(null)}
                subtitle={`${selectedConv.type} conversation`} />
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
          {messages.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-500">Start the conversation</div>
          )}
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} isOwn={msg.sender_id === profile?.id} />
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={sendMessage} className="px-4 py-3 bg-white border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-800/20"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="w-10 h-10 rounded-xl bg-navy-800 hover:bg-navy-700 text-white flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Messages" action={
        <button className="btn-primary flex items-center gap-1.5">
          <Plus size={15} />New
        </button>
      } />

      <div className="max-w-2xl mx-auto px-4 py-4 pb-24 lg:pb-8 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-navy-800/20 border-t-navy-800 rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="card p-10 text-center">
            <MessageCircle size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">No conversations yet</p>
            <p className="text-xs text-slate-400 mt-1">Messages from teachers and staff will appear here</p>
          </div>
        ) : (
          conversations.map(conv => {
            const title = ConvTitle(conv, profile?.id ?? '');
            const typeColors: Record<string, string> = {
              staff: '#1e40af', class: '#2563eb', direct: '#0891b2',
              group: '#7c3aed', household: '#059669'
            };
            return (
              <button
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className="w-full card-hover p-4 flex items-center gap-3 text-left"
              >
                <ConvAvatar title={title} color={typeColors[conv.type] ?? '#1E3A5F'} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-navy-800 truncate">{title}</p>
                    {conv.last_message_at && (
                      <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(conv.last_message_at)}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 capitalize mt-0.5">
                    {conv.type} · {conv.participants?.length ?? 0} participants
                  </p>
                </div>
                <ChevronRight size={15} className="text-slate-300 flex-shrink-0" />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
