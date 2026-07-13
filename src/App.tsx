import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./lib/auth";
import { LoginPage } from "./routes/LoginPage";
import { AppShell } from "./routes/AppShell";
import { DashboardPage } from "./routes/DashboardPage";
import { AnnouncementsPage } from "./routes/AnnouncementsPage";
import { CalendarPage } from "./routes/CalendarPage";
import { AdminLayout, RequireAdmin } from "./routes/admin/AdminLayout";
import { AdminDashboardPage } from "./routes/admin/AdminDashboardPage";
import { AdminAnnouncementsPage } from "./routes/admin/AdminAnnouncementsPage";
import { AdminRosterPage } from "./routes/admin/AdminRosterPage";
import { AdminPeoplePage } from "./routes/admin/AdminPeoplePage";

export function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm opacity-60">Loading…</div>
    );
  }

  if (!session) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="announcements" element={<AdminAnnouncementsPage />} />
          <Route path="roster" element={<AdminRosterPage />} />
          <Route path="people" element={<AdminPeoplePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
