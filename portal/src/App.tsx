import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import ServiceDetail from "./pages/ServiceDetail";
import Wizard from "./pages/Wizard";
import Support from "./pages/Support";
import Docs from "./pages/Docs";
import Agent from "./pages/Agent";
import GettingStarted from "./pages/docs/GettingStarted";
import Services from "./pages/docs/Services";
import Installation from "./pages/docs/Installation";
import Troubleshooting from "./pages/docs/Troubleshooting";
import SelfHosting from "./pages/docs/SelfHosting";
import Contributing from "./pages/docs/Contributing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/:id" element={<ServiceDetail />} />
          <Route path="/wizard" element={<Wizard />} />
          <Route path="/support" element={<Support />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/agent" element={<Agent />} />
          <Route path="/docs/getting-started" element={<GettingStarted />} />
          <Route path="/docs/services" element={<Services />} />
          <Route path="/docs/installation" element={<Installation />} />
          <Route path="/docs/troubleshooting" element={<Troubleshooting />} />
          <Route path="/docs/self-hosting" element={<SelfHosting />} />
          <Route path="/docs/contributing" element={<Contributing />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
