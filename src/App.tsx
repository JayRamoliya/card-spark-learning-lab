
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index"; 
import DecksPage from "./pages/DecksPage";
import DeckFormPage from "./pages/DeckFormPage";
import DeckDetailsPage from "./pages/DeckDetailsPage";
import ReviewPage from "./pages/ReviewPage";
import StatsPage from "./pages/StatsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/decks" element={<DecksPage />} />
          <Route path="/decks/new" element={<DeckFormPage />} />
          <Route path="/decks/:deckId/edit" element={<DeckFormPage />} />
          <Route path="/decks/:deckId" element={<DeckDetailsPage />} />
          <Route path="/decks/:deckId/cards" element={<DeckDetailsPage />} />
          <Route path="/decks/:deckId/review" element={<ReviewPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
