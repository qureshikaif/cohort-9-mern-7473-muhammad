import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { RegisterPage } from './pages/RegisterPage';
import { Spinner } from './components/ui';

const NoteEditorPage = lazy(() =>
  import('./pages/NoteEditorPage').then((m) => ({ default: m.NoteEditorPage }))
);

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route
            path="notes/new"
            element={
              <ErrorBoundary>
                <Suspense fallback={<Spinner label="Loading the editor..." />}>
                  <NoteEditorPage />
                </Suspense>
              </ErrorBoundary>
            }
          />
          <Route
            path="notes/:id"
            element={
              <ErrorBoundary>
                <Suspense fallback={<Spinner label="Finding your note..." />}>
                  <NoteEditorPage />
                </Suspense>
              </ErrorBoundary>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
