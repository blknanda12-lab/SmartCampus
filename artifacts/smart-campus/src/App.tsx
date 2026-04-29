import { AppShell } from "@/components/layout/AppShell";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Resources from "@/pages/Resources";
import ResourceDetail from "@/pages/ResourceDetail";
import Bookings from "@/pages/Bookings";
import MapView from "@/pages/Map";
import Analytics from "@/pages/Analytics";
import Notifications from "@/pages/Notifications";
import Admin from "@/pages/Admin";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";

// Configure API base URL from environment variables for production deployment
const apiUrl = import.meta.env.VITE_API_URL || "";
if (apiUrl) {
  setBaseUrl(apiUrl);
}

setAuthTokenGetter(() => localStorage.getItem("token"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

type ProtectedProps = {
  children: React.ReactNode;
  roles?: Array<"admin" | "faculty" | "student">;
};

function Protected({ children, roles }: ProtectedProps) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Redirect to="/" />;
  if (roles && user && !roles.includes(user.role as "admin" | "faculty" | "student")) {
    return <Redirect to="/dashboard" />;
  }
  return <AppShell>{children}</AppShell>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Redirect to="/dashboard" />;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <PublicOnly>
          <Login />
        </PublicOnly>
      </Route>
      <Route path="/dashboard">
        <Protected>
          <Dashboard />
        </Protected>
      </Route>
      <Route path="/resources">
        <Protected>
          <Resources />
        </Protected>
      </Route>
      <Route path="/resources/:id">
        <Protected>
          <ResourceDetail />
        </Protected>
      </Route>
      <Route path="/bookings">
        <Protected>
          <Bookings />
        </Protected>
      </Route>
      <Route path="/map">
        <Protected>
          <MapView />
        </Protected>
      </Route>
      <Route path="/analytics">
        <Protected roles={["admin"]}>
          <Analytics />
        </Protected>
      </Route>
      <Route path="/notifications">
        <Protected>
          <Notifications />
        </Protected>
      </Route>
      <Route path="/admin">
        <Protected roles={["admin"]}>
          <Admin />
        </Protected>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL === "/" ? "" : import.meta.env.BASE_URL}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
        <SonnerToaster richColors position="top-right" />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
