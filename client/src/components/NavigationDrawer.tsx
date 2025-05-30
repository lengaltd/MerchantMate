import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  Package, 
  Users, 
  ShoppingCart, 
  Receipt, 
  BarChart3, 
  FileText, 
  Settings, 
  LogOut,
  User,
  Crown,
  Shield,
  Building2
} from "lucide-react";

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
}

export default function NavigationDrawer({ isOpen, onClose }: NavigationDrawerProps) {
  const { user } = useAuth();
  const [location] = useLocation();

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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="h-4 w-4" />;
      case 'app_staff':
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
      path: "/products",
      label: "Products & Services",
      icon: <Package className="h-5 w-5" />,
      roles: ['merchant', 'staff'],
    },
    {
      path: "/customers",
      label: "Customers",
      icon: <Users className="h-5 w-5" />,
      roles: ['merchant', 'staff'],
    },
    {
      path: "/sales",
      label: "Sales",
      icon: <ShoppingCart className="h-5 w-5" />,
      roles: ['merchant', 'staff'],
    },
    {
      path: "/expenses",
      label: "Expenses",
      icon: <Receipt className="h-5 w-5" />,
      roles: ['merchant', 'staff'],
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
      path: "/super-admin",
      label: "Super Admin Dashboard",
      icon: <Shield className="h-5 w-5" />,
    },
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
      path: "/app-staff",
      label: "APP Staff Dashboard",
      icon: <Shield className="h-5 w-5" />,
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

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role);
  });

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const getMenuItems = () => {
    if (user?.role === 'super_admin') {
      return [...filteredMenuItems, ...superAdminItems];
    }
    if (user?.role === 'app_staff') {
      return [...filteredMenuItems, ...appStaffItems];
    }
    return filteredMenuItems;
  };

  if (!user) return null;

  return (
    <div 
      className={`fixed inset-y-0 left-0 w-72 bg-white shadow-xl transform transition-transform duration-300 z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* User Profile Section */}
      <div className="p-4 bg-primary text-white">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-lg font-medium">
                {user.fullName ? getInitials(user.fullName) : <User className="h-6 w-6" />}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">
              {user.fullName || user.firstName || 'User'}
            </h3>
            <p className="text-sm opacity-90 truncate">
              {user.phoneNumber || user.email || ''}
            </p>
            <div className="flex items-center space-x-1 text-xs opacity-75 mt-1">
              {getRoleIcon(user.role || 'merchant')}
              <span>{getRoleDisplayName(user.role || 'merchant')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {getMenuItems().map((item) => {
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start space-x-3 h-12 ${
                    isActive 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={onClose}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Settings and Logout */}
        <div className="mt-8 pt-4 border-t border-gray-200 space-y-2">
          <Link href="/settings">
            <Button
              variant="ghost"
              className={`w-full justify-start space-x-3 h-12 ${
                location === '/settings'
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={onClose}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start space-x-3 h-12 text-gray-700 hover:bg-gray-100"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}