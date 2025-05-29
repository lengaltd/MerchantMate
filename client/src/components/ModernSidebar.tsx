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
    <div className="w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 h-full flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-full"></div>
      
      {/* Logo and Header */}
      <div className="p-6 border-b border-slate-700/50 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              POS System
            </h1>
            <p className="text-xs text-slate-400">Admin Console</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-slate-700/50 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">
              {((user as any)?.fullName || "Super Admin").charAt(0)}
            </span>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-1">Welcome back</div>
            <div className="font-semibold text-white">{(user as any)?.fullName || "Super Admin"}</div>
            <Badge className="mt-2 text-xs bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white">
              {(user as any)?.role || "Super Admin"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-6 relative z-10">
        <div className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-left group relative overflow-hidden border-0 ${
                    item.active 
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  } transition-all duration-300`}
                  size="lg"
                >
                  {item.active && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse"></div>
                  )}
                  <Icon className="w-5 h-5 mr-4 relative z-10" />
                  <span className="relative z-10 font-medium">{item.label}</span>
                  {item.active && (
                    <ChevronRight className="w-4 h-4 ml-auto relative z-10" />
                  )}
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-6 border-t border-slate-700/50 relative z-10">
        <Button
          variant="ghost"
          onClick={onLogout}
          className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700/50 border-0 transition-all duration-300 group"
          size="lg"
        >
          <LogOut className="w-5 h-5 mr-4 group-hover:text-red-400 transition-colors duration-300" />
          <span className="font-medium">Sign Out</span>
        </Button>
      </div>
    </div>
  );
}