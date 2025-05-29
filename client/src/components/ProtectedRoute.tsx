import { useAuth } from "@/hooks/useAuth";
import { ComponentType } from "react";

interface ProtectedRouteProps {
  component: ComponentType<any>;
  path?: string;
  allowedRoles?: string[];
  [key: string]: any;
}

export default function ProtectedRoute({ 
  component: Component, 
  allowedRoles, 
  ...props 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-variant">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-on-surface">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-variant">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-xl font-bold text-on-surface mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to access this page.</p>
          <button
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-variant">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-xl font-bold text-on-surface mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. 
            Required roles: {allowedRoles.join(', ')}
          </p>
          <p className="text-sm text-gray-500">
            Your current role: {user.role}
          </p>
        </div>
      </div>
    );
  }

  return <Component {...props} />;
}
