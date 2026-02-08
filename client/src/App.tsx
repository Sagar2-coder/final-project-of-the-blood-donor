import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import DonorsList from "@/pages/DonorsList";
import RegisterDonor from "@/pages/RegisterDonor";
import AuthPage from "@/pages/AuthPage";
import AdminPanel from "@/pages/AdminPanel";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ component: Component, adminOnly = false }: { component: any; adminOnly?: boolean }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <AuthPage />;
  if (adminOnly && !user.isAdmin) return <NotFound />;

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/donors" component={DonorsList} />
      <Route path="/register-donor">
        {() => <ProtectedRoute component={RegisterDonor} />}
      </Route>
      <Route path="/admin">
        {() => <ProtectedRoute component={AdminPanel} adminOnly={true} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
