import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useFirebaseAuth';
import { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAdminStatus = () => {
      console.log('Environment check:', {
        isDev: window.location.hostname === 'localhost',
        isProd: window.location.hostname.includes('vercel.app') || window.location.hostname.includes('.app'),
        currentHost: window.location.hostname,
        userEmail: user?.email
      });

      if (user) {
        console.log('Checking admin status for user:', user.email);
        
        // Enhanced admin emails list with more flexibility
        const adminEmails = [
          'admin@gmail.com', 
          'ari4rich@gmail.com'
        ];
        
        const userIsAdmin = adminEmails.includes(user.email || '');
        
        console.log('Admin check result:', {
          userEmail: user.email,
          isAdmin: userIsAdmin,
          adminEmails
        });
        
        setIsAdmin(userIsAdmin);
      } else {
        console.log('No user found');
        setIsAdmin(false);
      }
      setLoading(false);
    };

    if (!authLoading) {
      checkAdminStatus();
    }
  }, [user, authLoading]);

  // Add more detailed loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
          <p className="text-sm text-gray-400 mt-2">
            {authLoading ? 'Checking authentication...' : 'Verifying admin access...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('No user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    console.log('User is not admin, redirecting to home. User email:', user.email);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have admin privileges to access this page.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Current user: {user.email}
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;