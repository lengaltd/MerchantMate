import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Customers from "@/pages/Customers";
import Sales from "@/pages/Sales";
import Expenses from "@/pages/Expenses";
import Analytics from "@/pages/Analytics";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

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
          <Layout>
            <Switch>
              <Route path="/" component={Dashboard} />
              <ProtectedRoute path="/products" component={Products} />
              <ProtectedRoute path="/customers" component={Customers} />
              <ProtectedRoute path="/sales" component={Sales} />
              <ProtectedRoute path="/expenses" component={Expenses} />
              <ProtectedRoute path="/analytics" component={Analytics} />
              <ProtectedRoute path="/reports" component={Reports} />
              <ProtectedRoute path="/settings" component={Settings} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
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
