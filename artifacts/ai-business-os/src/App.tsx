import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { isLoggedIn } from "@/lib/auth";

import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import DashboardPage from "@/pages/dashboard";
import ClientsPage from "@/pages/clients";
import ClientDetailPage from "@/pages/client-detail";
import DealsPage from "@/pages/deals";
import DealDetailPage from "@/pages/deal-detail";
import TasksPage from "@/pages/tasks";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isError } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      enabled: isLoggedIn(),
      retry: false,
    },
  });

  if (!isLoggedIn()) {
    return <Redirect to="/login" />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

function ProtectedDashboard() {
  return <AuthGuard><DashboardPage /></AuthGuard>;
}
function ProtectedClients() {
  return <AuthGuard><ClientsPage /></AuthGuard>;
}
function ProtectedClientDetail() {
  return <AuthGuard><ClientDetailPage /></AuthGuard>;
}
function ProtectedDeals() {
  return <AuthGuard><DealsPage /></AuthGuard>;
}
function ProtectedDealDetail() {
  return <AuthGuard><DealDetailPage /></AuthGuard>;
}
function ProtectedTasks() {
  return <AuthGuard><TasksPage /></AuthGuard>;
}

function HomeRedirect() {
  return <Redirect to={isLoggedIn() ? "/dashboard" : "/login"} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/dashboard" component={ProtectedDashboard} />
      <Route path="/clients/:id" component={ProtectedClientDetail} />
      <Route path="/clients" component={ProtectedClients} />
      <Route path="/deals/:id" component={ProtectedDealDetail} />
      <Route path="/deals" component={ProtectedDeals} />
      <Route path="/tasks" component={ProtectedTasks} />
      <Route path="/" component={HomeRedirect} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
