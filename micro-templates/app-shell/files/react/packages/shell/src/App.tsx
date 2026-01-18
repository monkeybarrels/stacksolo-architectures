import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './core/stores/auth';
import { ShellLayout } from './core/layouts/ShellLayout';
import { Login } from './pages/Login';
import { routes as featureRoutes } from './core/router';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <ShellLayout>
              <Routes>
                {featureRoutes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={route.element}
                  />
                ))}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </ShellLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
