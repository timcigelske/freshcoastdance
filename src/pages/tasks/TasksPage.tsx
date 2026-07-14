import React, { useEffect, useState } from 'react';
import { CheckSquare, CheckCircle, Clock, Plus, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Task, Dancer } from '../../lib/types';
import { Header } from '../../components/layout/Header';

function formatDue(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((d.getTime() - now.getTime()) / 86400000);
  if (diff < 0) return { label: 'Overdue', cls: 'text-red-600 bg-red-50' };
  if (diff === 0) return { label: 'Due today', cls: 'text-amber-700 bg-amber-50' };
  if (diff === 1) return { label: 'Due tomorrow', cls: 'text-amber-600 bg-amber-50' };
  return {
    label: `Due ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    cls: 'text-slate-600 bg-slate-100'
  };
}

const TASK_TYPE_LABELS: Record<string, string> = {
  action: 'Action required',
  acknowledgment: 'Acknowledgment',
  form: 'Form',
  waiver: 'Waiver',
  signup: 'Sign-up',
  upload: 'File upload',
};

function TaskCard({ task, completed, dancers, onComplete }: {
  task: Task;
  completed: boolean;
  dancers: Dancer[];
  onComplete: (taskId: string, dancerId?: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const dueInfo = task.due_at ? formatDue(task.due_at) : null;

  return (
    <div className={`card overflow-hidden transition-all ${completed ? 'opacity-60' : ''}`}>
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
            completed ? 'bg-emerald-50' : 'bg-amber-50'
          }`}>
            {completed
              ? <CheckCircle size={18} className="text-emerald-500" />
              : <CheckSquare size={18} className="text-amber-500" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {TASK_TYPE_LABELS[task.task_type] ?? task.task_type}
              </span>
              {dueInfo && !completed && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${dueInfo.cls}`}>
                  <Clock size={10} />
                  {dueInfo.label}
                </span>
              )}
              {completed && (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Completed</span>
              )}
            </div>
            <p className={`text-sm font-bold leading-snug ${completed ? 'line-through text-slate-500' : 'text-navy-800'}`}>
              {task.title}
            </p>
          </div>
        </div>

        {expanded && task.description && (
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">{task.description}</p>
        )}

        {expanded && !completed && (
          <div className="mt-3 space-y-2">
            {dancers.length > 0 && task.task_type !== 'form' ? (
              dancers.map(dancer => (
                <div key={dancer.id} className="flex items-center justify-between gap-2 py-1.5 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-navy-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-navy-800">{dancer.first_name[0]}</span>
                    </div>
                    <span className="text-xs font-medium text-slate-700">{dancer.first_name}</span>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); onComplete(task.id, dancer.id); }}
                    className="text-xs font-semibold text-navy-800 bg-navy-50 hover:bg-navy-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle size={12} />
                    Mark complete
                  </button>
                </div>
              ))
            ) : (
              <button
                onClick={e => { e.stopPropagation(); onComplete(task.id); }}
                className="w-full mt-1 py-2.5 bg-navy-800 hover:bg-navy-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <CheckCircle size={15} />
                Mark as Complete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function TasksPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<Set<string>>(new Set());
  const [dancers, setDancers] = useState<Dancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'completed' | 'all'>('pending');
  const isStaff = profile?.role && ['owner', 'admin', 'teacher'].includes(profile.role);

  useEffect(() => { loadData(); }, [profile?.id]);

  async function loadData() {
    setLoading(true);
    const [tasksRes, completionsRes, dancersRes] = await Promise.all([
      supabase.from('tasks').select('*').eq('is_active', true).order('due_at', { ascending: true, nullsFirst: false }),
      profile?.id
        ? supabase.from('task_completions').select('task_id').eq('user_id', profile.id)
        : { data: [], error: null },
      profile?.household_id
        ? supabase.from('dancers').select('*').eq('household_id', profile.household_id).eq('is_active', true)
        : { data: [], error: null }
    ]);

    setTasks(tasksRes.data ?? []);
    setCompletions(new Set(completionsRes.data?.map(c => c.task_id) ?? []));
    setDancers(dancersRes.data ?? []);
    setLoading(false);
  }

  async function handleComplete(taskId: string, dancerId?: string) {
    if (!profile?.id) return;
    await supabase.from('task_completions').insert({
      task_id: taskId,
      user_id: profile.id,
      dancer_id: dancerId ?? null
    });
    setCompletions(prev => new Set([...prev, taskId]));
  }

  const pending = tasks.filter(t => !completions.has(t.id));
  const completed = tasks.filter(t => completions.has(t.id));
  const displayed = filter === 'pending' ? pending : filter === 'completed' ? completed : tasks;

  return (
    <div className="flex-1 overflow-y-auto">
      <Header
        title="Tasks"
        subtitle={`${pending.length} pending`}
        action={isStaff ? (
          <button className="btn-primary flex items-center gap-1.5">
            <Plus size={15} />New
          </button>
        ) : undefined}
      />

      <div className="max-w-2xl mx-auto px-4 py-4 pb-24 lg:pb-8 space-y-4">
        <div className="flex gap-2">
          {(['pending', 'completed', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all capitalize ${
                filter === f ? 'bg-navy-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-navy-800/30'
              }`}
            >
              {f} {f === 'pending' ? `(${pending.length})` : f === 'completed' ? `(${completed.length})` : `(${tasks.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-navy-800/20 border-t-navy-800 rounded-full animate-spin" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="card p-10 text-center">
            <CheckSquare size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">
              {filter === 'pending' ? 'No pending tasks' : filter === 'completed' ? 'No completed tasks' : 'No tasks yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                completed={completions.has(task.id)}
                dancers={dancers}
                onComplete={handleComplete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
