import React, { useEffect, useState } from 'react';
import { Users, ChevronRight, Megaphone, Calendar, FileText, MessageCircle, Plus, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Group } from '../../lib/types';
import { Header } from '../../components/layout/Header';

const TYPE_LABELS: Record<string, string> = {
  studio: 'Studio-wide',
  staff: 'Staff',
  company: 'Company',
  competition: 'Competition',
  recreational: 'Class',
  recital: 'Recital',
  parent: 'Parent',
  special: 'Special',
  general: 'General',
};

function GroupCard({ group, onClick }: { group: Group & { membership_count?: number }; onClick: () => void }) {
  const initials = group.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="card-hover p-4 cursor-pointer flex items-start gap-3" onClick={onClick}>
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
        style={{ backgroundColor: group.color_hex }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-navy-800 truncate">{group.name}</p>
          {group.is_private && <Lock size={12} className="text-slate-400 flex-shrink-0" />}
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          {TYPE_LABELS[group.type] ?? group.type}
          {group.member_count !== undefined && ` · ${group.member_count} member${group.member_count !== 1 ? 's' : ''}`}
        </p>
        {group.description && (
          <p className="text-xs text-slate-600 mt-1 line-clamp-2">{group.description}</p>
        )}
      </div>
      <ChevronRight size={16} className="text-slate-300 flex-shrink-0 mt-0.5" />
    </div>
  );
}

function GroupDetailView({ group, onBack }: { group: Group; onBack: () => void }) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('group_memberships')
      .select('*, profile:user_id(full_name, role, email)')
      .eq('group_id', group.id)
      .eq('is_active', true)
      .then(({ data }) => {
        setMembers(data ?? []);
        setLoading(false);
      });
  }, [group.id]);

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title={group.name} onBack={onBack} subtitle={TYPE_LABELS[group.type] ?? group.type} />

      <div className="max-w-2xl mx-auto px-4 py-4 pb-24 lg:pb-8 space-y-4">
        {/* Group banner */}
        <div
          className="rounded-2xl h-24 flex items-end p-4"
          style={{ background: `linear-gradient(135deg, ${group.color_hex}dd, ${group.color_hex}88)` }}
        >
          <div>
            <h2 className="text-white font-bold text-lg">{group.name}</h2>
            {group.description && <p className="text-white/80 text-xs mt-0.5">{group.description}</p>}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Megaphone, label: 'Posts' },
            { icon: Calendar, label: 'Events' },
            { icon: FileText, label: 'Files' },
            { icon: MessageCircle, label: 'Chat' },
          ].map(({ icon: Icon, label }) => (
            <button key={label} className="card p-3 flex flex-col items-center gap-1.5 hover:bg-slate-50 transition-colors">
              <Icon size={18} className="text-navy-800" strokeWidth={1.8} />
              <span className="text-xs font-medium text-slate-600">{label}</span>
            </button>
          ))}
        </div>

        {/* Members */}
        <section>
          <h2 className="text-sm font-bold text-navy-800 mb-3">Members ({members.length})</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-navy-800/20 border-t-navy-800 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-1.5">
              {members.map(m => (
                <div key={m.id} className="card p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-navy-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">
                      {m.profile?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-800 truncate">{m.profile?.full_name ?? 'Unknown'}</p>
                    <p className="text-xs text-slate-500 capitalize">{m.profile?.role}</p>
                  </div>
                  {m.role === 'admin' && (
                    <span className="text-xs bg-navy-50 text-navy-800 px-2 py-0.5 rounded-full font-medium">Admin</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export function GroupsPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { profile } = useAuth();
  const [groups, setGroups] = useState<(Group & { membership_count?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const isStaff = profile?.role && ['owner', 'admin', 'teacher'].includes(profile.role);

  useEffect(() => { loadGroups(); }, []);

  async function loadGroups() {
    setLoading(true);
    const { data: groupsData } = await supabase
      .from('groups')
      .select('*')
      .eq('is_active', true)
      .order('type')
      .order('name');

    if (groupsData) {
      // Get member counts
      const counts = await Promise.all(
        groupsData.map(g =>
          supabase.from('group_memberships')
            .select('id', { count: 'exact', head: true })
            .eq('group_id', g.id)
            .eq('is_active', true)
        )
      );
      setGroups(groupsData.map((g, i) => ({ ...g, member_count: counts[i].count ?? 0 })));
    }
    setLoading(false);
  }

  if (selectedGroup) {
    return <GroupDetailView group={selectedGroup} onBack={() => setSelectedGroup(null)} />;
  }

  // Group by type
  const typeOrder = ['studio', 'staff', 'company', 'competition', 'recreational', 'recital', 'parent', 'special', 'general'];
  const grouped: Record<string, typeof groups> = {};
  groups.forEach(g => {
    if (!grouped[g.type]) grouped[g.type] = [];
    grouped[g.type].push(g);
  });

  return (
    <div className="flex-1 overflow-y-auto">
      <Header
        title="Groups"
        action={isStaff ? (
          <button className="btn-primary flex items-center gap-1.5">
            <Plus size={15} />New
          </button>
        ) : undefined}
      />

      <div className="max-w-2xl mx-auto px-4 py-4 pb-24 lg:pb-8 space-y-5">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-navy-800/20 border-t-navy-800 rounded-full animate-spin" />
          </div>
        ) : groups.length === 0 ? (
          <div className="card p-10 text-center">
            <Users size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">No groups yet</p>
          </div>
        ) : (
          typeOrder.filter(t => grouped[t]?.length).map(type => (
            <section key={type}>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {TYPE_LABELS[type] ?? type}
              </h2>
              <div className="space-y-2">
                {grouped[type].map(group => (
                  <GroupCard key={group.id} group={group} onClick={() => setSelectedGroup(group)} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
