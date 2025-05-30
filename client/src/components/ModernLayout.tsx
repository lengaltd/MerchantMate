
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { 
  Menu, 
  Bell, 
  User, 
  Home, 
  Users, 
  BarChart3, 
  FileText, 
  Settings, 
  LogOut,
  Crown,
  Shield,
  Building2,
  X,
  ChevronRight
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
}

export default function ModernLayout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const { user } = useAuth();
  const [location] = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'APP_STAFF':
        return 'APP Staff';
      case 'MERCHANT':
        return 'Merchant';
      case 'SPONSOR':
        return 'Sponsor';
      default:
        return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Crown className="h-4 w-4" />;
      case 'APP_STAFF':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const menuItems: MenuItem[] = [
    {
      path: "/",
      label: "Dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      path: "/analytics",
      label: "Analytics",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      path: "/reports",
      label: "Reports",
      icon: <FileText className="h-5 w-5" />,
    },
  ];

  const superAdminItems: MenuItem[] = [
    {
      path: "/staff",
      label: "Staff Management",
      icon: <Users className="h-5 w-5" />,
    },
    {
      path: "/sponsors",
      label: "Sponsors Management",
      icon: <Building2 className="h-5 w-5" />,
    },
  ];

  const appStaffItems: MenuItem[] = [
    {
      path: "/merchants",
      label: "Merchant Management",
      icon: <Building2 className="h-5 w-5" />,
    },
  ];

  const getMenuItems = () => {
    if (user?.role === 'SUPER_ADMIN') {
      return [...menuItems, ...superAdminItems];
    }
    if (user?.role === 'APP_STAFF') {
      return [...menuItems, ...appStaffItems];
    }
    return menuItems;
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        </div>
      </div>

      {/* Glassmorphic Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrollY > 10 
            ? 'backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-2xl' 
            : 'backdrop-blur-md bg-white/5'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200 hover:scale-105"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white bg-gradient-to-r from-white to-purple-200 bg-clip-text">
                BizPOS
              </h1>
              <p className="text-xs text-white/70 font-medium">
                {getRoleDisplayName(user.role)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200 hover:scale-105 relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-500 text-xs rounded-full w-5 h-5 flex items-center justify-center text-white font-bold animate-pulse">
                3
              </span>
            </Button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-10 h-10 rounded-xl object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-white">
                  {user?.fullName ? getInitials(user.fullName) : <User className="h-5 w-5" />}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Slide-out Navigation Menu */}
      <div 
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          isMenuOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Menu Panel */}
        <div 
          className={`absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white/10 backdrop-blur-xl border-r border-white/20 transition-transform duration-300 ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Menu Header */}
          <div className="p-6 border-b border-white/20 bg-gradient-to-r from-purple-600/20 to-pink-600/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt="Profile"
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-white">
                      {user.fullName ? getInitials(user.fullName) : <User className="h-6 w-6" />}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">
                    {user.fullName || user.firstName || 'User'}
                  </h3>
                  <div className="flex items-center space-x-1 text-sm text-white/70">
                    {getRoleIcon(user.role)}
                    <span>{getRoleDisplayName(user.role)}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-2 rounded-xl"
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="p-4 space-y-2">
            {getMenuItems().map((item, index) => {
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-between h-14 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white border border-white/20 shadow-lg' 
                        : 'text-white/80 hover:bg-white/10 hover:text-white hover:scale-105'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Menu Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20 bg-gradient-to-r from-slate-900/50 to-purple-900/50 space-y-2">
            <Link href="/settings">
              <Button
                variant="ghost"
                className="w-full justify-between h-12 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start space-x-3 h-12 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 pt-20 min-h-screen">
        <div className="backdrop-blur-sm bg-white/5 min-h-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation (if needed) */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/10 border-t border-white/20">
          <div className="flex justify-around py-2">
            {getMenuItems().slice(0, 4).map((item) => {
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex flex-col items-center space-y-1 p-3 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'text-white bg-white/20' 
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {item.icon}
                    <span className="text-xs font-medium">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
