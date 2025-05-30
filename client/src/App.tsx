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
      <div className="min-h-screen flex items-center justify-center bg-surface-variant">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-on-surface">Loading...</p>
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