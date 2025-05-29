import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  BarChart3, 
  FileText, 
  LogOut,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  onLogout: () => void;
}

export default function ModernSidebar({ onLogout }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { 
      path: "/", 
      label: "Dashboard", 
      icon: LayoutDashboard,
      active: location === "/"
    },
    { 
      path: "/staff", 
      label: "APP Staff", 
      icon: Users,
      active: location === "/staff"
    },
    { 
      path: "/sponsors", 
      label: "Sponsors", 
      icon: Building2,
      active: location === "/sponsors"
    },
    { 
      path: "/analytics", 
      label: "Analytics", 
      icon: BarChart3,
      active: location === "/analytics"
    },
    { 
      path: "/reports", 
      label: "Reports", 
      icon: FileText,
      active: location === "/reports"
    }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Logo and Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">POS System</h1>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-100">
        <div className="text-sm text-gray-500 mb-1">Welcome back</div>
        <div className="font-semibold text-gray-900">{(user as any)?.fullName || "Super Admin"}</div>
        <Badge variant="secondary" className="mt-2 text-xs">
          {(user as any)?.role || "Super Admin"}
        </Badge>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={item.active ? "default" : "ghost"}
                  className={`w-full justify-start text-left ${
                    item.active 
                      ? "bg-blue-600 text-white hover:bg-blue-700" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  size="sm"
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                  {item.active && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-100">
        <Button
          variant="ghost"
          onClick={onLogout}
          className="w-full justify-start text-gray-700 hover:bg-gray-100"
          size="sm"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}