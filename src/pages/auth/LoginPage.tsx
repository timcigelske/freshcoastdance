import React, { useState } from 'react';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoAccounts = [
    { label: 'Studio Owner', email: 'owner@freshcoastdance.com', role: 'owner' },
    { label: 'Administrator', email: 'admin@freshcoastdance.com', role: 'admin' },
    { label: 'Ballet Teacher', email: 'teacher.ballet@freshcoastdance.com', role: 'teacher' },
    { label: 'Parent', email: 'parent1@example.com', role: 'parent' },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) setError('Invalid email or password. Please try again.');
  }

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword('FreshCoast2026!');
    setError('');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-800 to-navy-900 flex flex-col items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-sapphire-600/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-sapphire-500/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
            <span className="text-white font-bold text-2xl">FC</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Fresh Coast Connect</h1>
          <p className="text-navy-200 mt-1.5 text-sm">Organize everything. Notify everyone.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-navy-800 mb-6">Sign in to your account</h2>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4 text-red-700 text-sm">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-navy-800/20 focus:border-navy-800/40 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-navy-800/20 focus:border-navy-800/40 transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy-800 text-white font-semibold py-3 rounded-xl hover:bg-navy-700 transition-colors duration-150 flex items-center justify-center gap-2 text-sm disabled:opacity-60"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn size={16} />
              )}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Demo accounts — password: FreshCoast2026!
            </p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map(({ label, email: demoEmail, role }) => (
                <button
                  key={demoEmail}
                  onClick={() => fillDemo(demoEmail)}
                  className="text-left px-3 py-2.5 rounded-xl border border-slate-200 hover:border-navy-800/30 hover:bg-navy-50 transition-all group"
                >
                  <p className="text-xs font-semibold text-navy-800 group-hover:text-navy-900">{label}</p>
                  <p className="text-xs text-slate-500 capitalize mt-0.5">{role}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-navy-300 text-xs mt-6">
          Fresh Coast Dance — Private Member Portal
        </p>
      </div>
    </div>
  );
}
