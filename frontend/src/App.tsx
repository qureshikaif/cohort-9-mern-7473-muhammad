import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Spinner } from './components/ui';

// The rich text editor pulls in TipTap and ProseMirror, which is most of the
// bundle. Loading it only when a note is opened keeps the first paint small.
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
          <Route
            path="notes/new"
            element={
              <Suspense fallback={<Spinner label="Sharpening a pencil…" />}>
                <NoteEditorPage />
              </Suspense>
            }
          />
          <Route
            path="notes/:id"
            element={
              <Suspense fallback={<Spinner label="Finding your note…" />}>
                <NoteEditorPage />
              </Suspense>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
