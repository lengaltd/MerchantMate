import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  ShoppingCart, 
  Package, 
  Users, 
  MoreHorizontal,
  Plus
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function BottomNavigation() {
  const [location] = useLocation();
  const { user } = useAuth();

  const navigationItems = [
    {
      path: "/",
      label: "Dashboard",
      icon: Home,
    },
    {
      path: "/sales",
      label: "Sales",
      icon: ShoppingCart,
      roles: ['merchant', 'staff'],
    },
    {
      path: "/products",
      label: "Products",
      icon: Package,
      roles: ['merchant', 'staff'],
    },
    {
      path: "/customers",
      label: "Customers",
      icon: Users,
      roles: ['merchant', 'staff'],
    },
    {
      path: "/analytics",
      label: "More",
      icon: MoreHorizontal,
    },
  ];

  const filteredItems = navigationItems.filter(item => {
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role);
  });

  // Ensure we always have 5 items for proper spacing
  const items = filteredItems.slice(0, 5);

  return (
    <>
      {/* Floating Action Button */}
      <Button 
        className="fixed bottom-20 right-4 w-14 h-14 bg-secondary text-white rounded-full shadow-lg fab-shadow active:scale-95 transition-transform z-30"
        size="sm"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-40">
        <div className="flex items-center justify-around">
          {items.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  className={`flex flex-col items-center space-y-1 h-auto py-2 px-3 min-w-0 ${
                    isActive 
                      ? 'text-primary' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium leading-none">
                    {item.label}
                  </span>
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
