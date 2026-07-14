import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';
import { ParentDashboard } from './pages/dashboard/ParentDashboard';
import { StaffDashboard } from './pages/dashboard/StaffDashboard';
import { AnnouncementsPage } from './pages/announcements/AnnouncementsPage';
import { CalendarPage } from './pages/calendar/CalendarPage';
import { FilesPage } from './pages/files/FilesPage';
import { GroupsPage } from './pages/groups/GroupsPage';
import { MessagesPage } from './pages/messages/MessagesPage';
import { TasksPage } from './pages/tasks/TasksPage';
import { AdminPage } from './pages/admin/AdminPage';
import { MorePage } from './pages/more/MorePage';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';

type Page =
  | 'home' | 'announcements' | 'calendar' | 'groups'
  | 'messages' | 'files' | 'tasks' | 'admin'
  | 'more' | 'notifications' | 'settings';

function NotificationsPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24 lg:pb-8">
        <h1 className="text-xl font-bold text-navy-800 mb-4">Notifications</h1>
        <div className="card p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-navy-50 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🔔</span>
          </div>
          <p className="text-slate-500 text-sm">Notification center coming soon</p>
          <p className="text-xs text-slate-400 mt-1">Push notifications are planned for Phase 2</p>
        </div>
      </div>
    </div>
  );
}

function SettingsPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const { profile, signOut } = useAuth();
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24 lg:pb-8">
        <h1 className="text-xl font-bold text-navy-800 mb-4">Settings</h1>
        <div className="card p-6 space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Account</p>
            <p className="text-sm font-bold text-navy-800">{profile?.full_name}</p>
            <p className="text-xs text-slate-500">{profile?.email}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Role</p>
            <p className="text-sm text-slate-700 capitalize">{profile?.role}</p>
          </div>
          <button
            onClick={signOut}
            className="text-sm text-red-600 font-semibold hover:text-red-700"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

function AppShell() {
  const { profile, loading } = useAuth();
  const [page, setPage] = useState<Page>('home');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-navy-800 flex items-center justify-center">
            <span className="text-white font-bold text-lg">FC</span>
          </div>
          <div className="w-6 h-6 border-2 border-navy-800/20 border-t-navy-800 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return <LoginPage />;
  }

  const isStaff = ['owner', 'admin', 'teacher'].includes(profile.role);

  function navigate(p: string) {
    setPage(p as Page);
  }

  function renderPage() {
    switch (page) {
      case 'home':
        return isStaff
          ? <StaffDashboard onNavigate={navigate} />
          : <ParentDashboard onNavigate={navigate} />;
      case 'announcements':
        return <AnnouncementsPage onNavigate={navigate} />;
      case 'calendar':
        return <CalendarPage onNavigate={navigate} />;
      case 'groups':
        return <GroupsPage onNavigate={navigate} />;
      case 'messages':
        return <MessagesPage onNavigate={navigate} />;
      case 'files':
        return <FilesPage onNavigate={navigate} />;
      case 'tasks':
        return <TasksPage onNavigate={navigate} />;
      case 'admin':
        return <AdminPage onNavigate={navigate} />;
      case 'more':
        return <MorePage onNavigate={navigate} />;
      case 'notifications':
        return <NotificationsPage onNavigate={navigate} />;
      case 'settings':
        return <SettingsPage onNavigate={navigate} />;
      default:
        return <ParentDashboard onNavigate={navigate} />;
    }
  }

  // Map bottom nav items to sidebar-friendly page names
  const bottomNavPage = ['home', 'messages', 'calendar', 'groups', 'more'].includes(page)
    ? page : page === 'announcements' ? 'announcements' : page;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <Sidebar current={page} onNavigate={navigate} />

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">
        {renderPage()}
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav current={bottomNavPage} onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
