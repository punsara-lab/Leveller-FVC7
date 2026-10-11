import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route, useNavigate, Link } from "react-router-dom";
import ProfessionalWelcomeScreen from "./components/ProfessionalWelcomeScreen";
import OnboardingScreen from "./components/OnboardingScreen";
import { getConfig } from "@/config/userConfig";
import StatusScreen from "./components/StatusScreen";
import FVC7Dashboard from "./components/FVC7Dashboard";
import SpiritualScreen from "./components/SpiritualScreen";
import PhysicalScreen from "./components/PhysicalScreen";
import ReportsScreen from "./components/ReportsScreen";
import NotFound from "./pages/NotFound";
import ArcWorkspace from "./components/arc/ArcWorkspace";
import NotificationManager, { SecurityManager } from "@/utils/notificationSystem";

const ArcStandalone = () => {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto mb-4 flex items-center justify-between">
        <Link to="/mission" className="text-xs text-muted-foreground hover:text-primary transition-colors">
          ← Back to Mission
        </Link>
        <a href="/arc.html" target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
          Open ARC.html (standalone) ↗
        </a>
      </div>
      <ArcWorkspace />
    </div>
  );
};

const queryClient = new QueryClient();

// Desktop (Electron) builds load over file:// where history routing breaks — use hash routing there.
const Router = typeof window !== "undefined" && window.location.protocol === "file:" ? HashRouter : BrowserRouter;

const AppRoutes = () => {
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);
  const [config, setConfig] = useState(() => getConfig());
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 4000); // Show welcome for 4 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleOnboarded = () => {
    setConfig({ ...getConfig() });
    setShowWelcomeMessage(true);
    
    // Fade out welcome message after 3 seconds
    setTimeout(() => {
      setShowWelcomeMessage(false);
    }, 3000);
  };

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  // Initialize security and notifications
  useEffect(() => {
    SecurityManager.initializeSecurity();
    
    // Request notification permission after welcome screen
    if (!showWelcome) {
      const notificationManager = NotificationManager.getInstance();
      notificationManager.requestPermission();
    }
  }, [showWelcome]);

  if (showWelcome) {
    return <ProfessionalWelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  if (!config.onboarded) {
    return <OnboardingScreen onComplete={handleOnboarded} />;
  }

  return (
    <>
      {showWelcomeMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-background/80 animate-fade-in">
          <div className="text-center animate-scale-in px-4">
            <div className="text-4xl md:text-6xl lg:text-7xl font-bold text-electric-blue animate-blue-glow mb-2 md:mb-4">
              WELCOME
            </div>
            <div className="text-2xl md:text-4xl lg:text-5xl font-medium text-accent">
              {config.name}
            </div>
            <div className="mt-4 md:mt-6 w-16 md:w-24 h-0.5 md:h-1 bg-gradient-to-r from-electric-blue to-accent mx-auto animate-progress-fill"></div>
          </div>
        </div>
      )}
      <Routes>
        <Route path="/" element={<StatusScreen />} />
        <Route path="/status" element={<StatusScreen />} />
        <Route path="/mission" element={<FVC7Dashboard />} />
        <Route path="/spiritual" element={<SpiritualScreen />} />
        <Route path="/physical" element={<PhysicalScreen />} />
        <Route path="/reports" element={<ReportsScreen />} />
        <Route path="/arc" element={<ArcStandalone />} />
        <Route path="/arc.html" element={<ArcStandalone />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <AppRoutes />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
