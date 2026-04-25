import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FirebaseSetupGate } from "@/components/FirebaseSetupGate";
import { AppShell } from "@/components/AppShell";

import Splash from "@/pages/Splash";
import Onboarding from "@/pages/Onboarding";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <FirebaseSetupGate>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<Splash />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/home" element={<Home />} />
              <Route path="/map" element={<PublicMap />} />
              <Route path="/report" element={<ReportFlow />} />
              <Route path="/analyze/:id" element={<AIAnalysis />} />
              <Route path="/review/:id" element={<ReportReview />} />
              <Route path="/track" element={<Track />} />
              <Route path="/urgency" element={<Urgency />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/r/:id" element={<ReportDetail />} />
              <Route path="/agency" element={<AgencyDashboard />} />
              <Route path="/agency/case/:id" element={<AgencyCaseDetail />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </FirebaseSetupGate>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
