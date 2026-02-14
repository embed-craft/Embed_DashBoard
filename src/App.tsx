import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import AdminLayout from "./layouts/AdminLayout";
import Clients from "./pages/admin/Clients";
import Stats from "./pages/admin/Stats";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Campaigns from "./pages/Campaigns";
import CampaignReport from "./pages/CampaignReport";
import CampaignBuilder from "./pages/CampaignBuilder";
import Segments from "./pages/Segments";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Events from "./pages/Events";
import Users from "./pages/Users";
import Assets from './pages/Assets';
import Templates from './pages/Templates';
import UserDetails from "./pages/UserDetails";
import Flows from "./pages/Flows";
import Pages from "./pages/Pages";
import NotFound from "./pages/NotFound";
import ApiPage from "./pages/ApiPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/landing" element={<LandingPage />} />

            <Route element={<ProtectedRoute />}>
              {/* Super Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Clients />} />
                <Route path="stats" element={<Stats />} />
              </Route>

              {/* Client Routes */}
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/campaigns" element={<Campaigns />} />
                <Route path="/campaigns/:id/report" element={<CampaignReport />} />
                <Route path="/campaign-builder" element={<CampaignBuilder />} />
                <Route path="/flows" element={<Flows />} />
                <Route path="/segments" element={<Segments />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/events" element={<Events />} />
                <Route path="/users" element={<Users />} />
                <Route path="/users/:id" element={<UserDetails />} />
                <Route path="/pages" element={<Pages />} />
                <Route path="/apis" element={<ApiPage />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/assets" element={<Assets />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
