import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FirebaseSetupGate } from "@/components/FirebaseSetupGate";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";

import Splash from "@/pages/Splash";
import Onboarding from "@/pages/Onboarding";
import Auth from "@/pages/Auth";
import Home from "@/pages/Home";
import PublicMap from "@/pages/PublicMap";
import ReportFlow from "@/pages/ReportFlow";
import AIAnalysis from "@/pages/AIAnalysis";
import ReportReview from "@/pages/ReportReview";
import ReportDetail from "@/pages/ReportDetail";
import Track from "@/pages/Track";
import Urgency from "@/pages/Urgency";
import Profile from "@/pages/Profile";
import Notifications from "@/pages/Notifications";
import AgencyDashboard from "@/pages/AgencyDashboard";
import AgencyCaseDetail from "@/pages/AgencyCaseDetail";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function RequireAgency({ children }: { children: JSX.Element }) {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (role !== "agency_official") return <Navigate to="/home" replace />;
  return children;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <FirebaseSetupGate>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppShell />}>
                <Route path="/" element={<Splash />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/signup" element={<Auth signup />} />

                <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
                <Route path="/map" element={<PublicMap />} />
                <Route path="/report" element={<RequireAuth><ReportFlow /></RequireAuth>} />
                <Route path="/analyze/:id" element={<RequireAuth><AIAnalysis /></RequireAuth>} />
                <Route path="/review/:id" element={<RequireAuth><ReportReview /></RequireAuth>} />
                <Route path="/track" element={<RequireAuth><Track /></RequireAuth>} />
                <Route path="/urgency" element={<Urgency />} />
                <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
                <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
                <Route path="/r/:id" element={<ReportDetail />} />

                <Route path="/agency" element={<RequireAgency><AgencyDashboard /></RequireAgency>} />
                <Route path="/agency/case/:id" element={<RequireAgency><AgencyCaseDetail /></RequireAgency>} />

                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </FirebaseSetupGate>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
