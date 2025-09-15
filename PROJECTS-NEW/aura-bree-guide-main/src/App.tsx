import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { trackReferral } from "./lib/referral";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Tarot from "./pages/Tarot";
import Horoscope from "./pages/Horoscope";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import Safety from "./pages/Safety";
import Settings from "./pages/Settings";
import Landing from "./pages/Landing";
import Clinics from "./pages/Clinics";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    trackReferral();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <div className="min-h-screen bg-background flex flex-col">
          <div className="flex-1 pb-20">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/app" element={<Index />} />
              <Route path="/chat" element={<Index initialTab="chat" />} />
              <Route path="/checkin" element={<Index initialTab="checkin" />} />
              <Route path="/toolkit" element={<Index initialTab="safety" />} />
              <Route path="/upgrades" element={<Index initialTab="upgrades" />} />

              <Route path="/tarot" element={<Tarot />} />
              <Route path="/horoscope" element={<Horoscope />} />

              <Route path="/safety" element={<Safety />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/clinics" element={<Clinics />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
        {/* Footer as separate section outside main app */}
        <Footer />
        {/* Global Emergency FAB */}
        <a href="tel:112" className="fixed bottom-20 right-5 z-50">
          <Button size="lg" className="w-14 h-14 rounded-full bg-destructive hover:bg-destructive/90 shadow-lg">
            <Phone className="w-6 h-6" />
          </Button>
        </a>
        <BottomNav />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
