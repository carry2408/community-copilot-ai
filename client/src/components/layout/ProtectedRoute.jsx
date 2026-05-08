import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--accent-indigo)] border-t-transparent animate-spin"></div>
          <p className="text-[var(--text-secondary)] text-sm">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    // Redirect to home if not logged in
    return <Navigate to="/" replace />;
  }

  return children;
}
