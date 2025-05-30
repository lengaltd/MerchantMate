import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Login from "@/pages/Login";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SponsorsManagement from "./pages/SponsorsManagement";
import StaffManagement from "./pages/StaffManagement";
import AppStaffDashboard from "./pages/AppStaffDashboard";
import MerchantManagement from "./pages/MerchantManagement";
import Analytics from "@/pages/Analytics";
import Reports from "@/pages/Reports";
import Landing from "@/pages/Landing";
import ModernLayout from "@/components/ModernLayout";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-10 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          </div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text">BizPOS</h2>
          <p className="text-white/70 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Login} />
      ) : (
        <Route path="/" nest>
          <ModernLayout>
            <Switch>
              {user?.role === 'SUPER_ADMIN' && (
                <>
                  <Route path="/" component={SuperAdminDashboard} />
                  <Route path="/staff" component={StaffManagement} />
                  <Route path="/sponsors" component={SponsorsManagement} />
                  <Route path="/analytics" component={Analytics} />
                  <Route path="/reports" component={Reports} />
                </>
              )}
              {user?.role === 'APP_STAFF' && (
                <>
                  <Route path="/" component={AppStaffDashboard} />
                  <Route path="/merchants" component={MerchantManagement} />
                  <Route path="/analytics" component={Analytics} />
                  <Route path="/reports" component={Reports} />
                </>
              )}
              <Route component={NotFound} />
            </Switch>
          </ModernLayout>
        </Route>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;