import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import Auth from "./pages/Auth";
import CollateralCalculator from "./pages/CollateralCalculator";
import Demos from "./pages/Demos";
import Docs from "./pages/Docs";
import Home from "./pages/Home";
import Innovation from "./pages/Innovation";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import VerifyCredential from "./pages/VerifyCredential";
import VerifyPublic from "./pages/VerifyPublic";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/demos" element={<Demos />} />
          <Route path="/verify-credential" element={<VerifyCredential />} />
          <Route
            path="/collateral-calculator"
            element={<CollateralCalculator />}
          />
          <Route path="/innovation" element={<Innovation />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/verify/:address" element={<VerifyPublic />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
