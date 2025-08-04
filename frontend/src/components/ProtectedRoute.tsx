import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: User['role'][];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Debug logging
  console.log('🛡️ ProtectedRoute check:', {
    isLoading,
    user: user ? { 
      id: user.id, 
      name: user.name, 
      role: user.role,
      localStorage_user: localStorage.getItem('water_billing_user') ? JSON.parse(localStorage.getItem('water_billing_user')!).role : 'none',
      localStorage_token: localStorage.getItem('water_billing_token') ? 'exists' : 'missing'
    } : null,
    allowedRoles,
    currentPath: location.pathname
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">
          <div className="h-8 w-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('❌ No user found, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log(`❌ Role ${user.role} not allowed. Required: ${allowedRoles.join(', ')}`);
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('✅ Access granted');
  return <>{children}</>;
};