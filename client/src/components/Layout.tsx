import { useState } from "react";
import NavigationDrawer from "./NavigationDrawer";
import BottomNavigation from "./BottomNavigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu, Bell, User } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'app_staff':
        return 'APP Staff';
      case 'merchant':
        return 'Merchant';
      case 'sponsor':
        return 'Sponsor';
      case 'staff':
        return 'Staff';
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-surface-variant">
      {/* Top App Bar */}
      <header className="bg-primary text-white px-3 sm:px-4 py-3 shadow-lg relative z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-2 flex-shrink-0"
              onClick={() => setIsDrawerOpen(true)}
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-medium truncate">BizPOS</h1>
              <p className="text-xs opacity-90 truncate">
                {user?.role ? getRoleDisplayName(user.role) : 'Dashboard'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-2 relative hidden sm:flex"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-accent text-xs rounded-full w-5 h-5 flex items-center justify-center text-white font-medium">
                3
              </span>
            </Button>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-xs sm:text-sm font-medium">
                  {user?.fullName ? getInitials(user.fullName) : <User className="h-3 w-3 sm:h-4 sm:w-4" />}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Drawer */}
      <NavigationDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />

      {/* Overlay */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
