
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "@/components/charts";
import { 
  ArrowRight, 
  Brain, 
  Clock, 
  Plus,
  Star,
  Bookmark
} from "lucide-react";
import { useStore } from "@/lib/store";
import Layout from "@/components/Layout";
import { toast } from "sonner";

// Motivational quotes
const QUOTES = [
  "The more you learn, the more you earn.",
  "Learning is not a spectator sport.",
  "The best way to predict your future is to create it.",
  "Learning is a treasure that will follow its owner everywhere.",
  "The only limit to our realization of tomorrow is our doubts of today.",
];

const Index = () => {
  const navigate = useNavigate();
  const { 
    decks, 
    flashcards, 
    settings,
    stats, 
    startReviewSession 
  } = useStore();
  
  const [quote] = useState(() => {
    const randomIndex = Math.floor(Math.random() * QUOTES.length);
    return QUOTES[randomIndex];
  });

  // Get today's cards
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  const dueToday = flashcards.filter(card => 
    new Date(card.nextReview) <= today
  );
  
  const newCards = flashcards.filter(card => 
    !card.lastReviewed
  );
  
  const recentMissed = flashcards.filter(card => 
    card.lastReviewed && card.ease < 3
  ).slice(0, 5);

  // Chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const reviewData = last7Days.map(date => {
    const entry = stats.history.find(h => h.date === date);
    return {
      name: date.split('-')[2], // Just the day
      total: entry?.reviewed || 0,
      correct: entry?.correct || 0
    };
  });

  // Handler for starting review session
  const handleStartReview = () => {
    if (dueToday.length === 0) {
      toast.info("No cards due for review today!");
      return;
    }
    
    startReviewSession();
    navigate('/review');
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Welcome panel */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  Welcome back, {settings.userName}!
                </h1>
                <p className="text-muted-foreground">
                  {quote}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>Current streak: {stats.streakDays} days</span>
                </div>
              </div>
              
              <Button 
                className="bg-brand-purple hover:bg-brand-purple/90" 
                onClick={handleStartReview}
              >
                Start Review
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                Due Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dueToday.length}</div>
              <p className="text-xs text-muted-foreground">
                {dueToday.length > 0 
                  ? `${Math.round((stats.cardsReviewedToday / settings.dailyCardLimit) * 100)}% of daily goal completed` 
                  : "All caught up!"}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Plus className="h-4 w-4 text-green-500" />
                New Cards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{newCards.length}</div>
              <p className="text-xs text-muted-foreground">
                {newCards.length > 0 
                  ? "Cards waiting for first review" 
                  : "No new cards to learn"}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Brain className="h-4 w-4 text-red-500" />
                Missed Cards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentMissed.length}</div>
              <p className="text-xs text-muted-foreground">
                Cards you found difficult recently
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Progress chart */}
        <Card>
          <CardHeader>
            <CardTitle>Review Progress</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <LineChart
              data={reviewData}
              categories={["total", "correct"]}
              colors={["#8B5CF6", "#4ADE80"]}
              valueFormatter={(value) => `${value} cards`}
              showLegend={true}
              showXAxis={true}
              showYAxis={true}
              yAxisWidth={30}
            />
          </CardContent>
        </Card>
        
        {/* Decks overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Decks</CardTitle>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
              onClick={() => navigate('/decks/new')}
            >
              <Plus className="h-4 w-4" />
              New Deck
            </Button>
          </CardHeader>
          <CardContent>
            {decks.length > 0 ? (
              <div className="space-y-2">
                {decks.map((deck) => {
                  const deckCards = flashcards.filter(card => card.deckId === deck.id);
                  const dueTodayCount = deckCards.filter(card => new Date(card.nextReview) <= today).length;
                  
                  return (
                    <div key={deck.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="bg-brand-purple/10 text-brand-purple p-2 rounded-md">
                          <Bookmark className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{deck.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {deckCards.length} cards • {dueTodayCount} due today
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/decks/${deck.id}`)}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-brand-purple hover:bg-brand-purple/90"
                          onClick={() => {
                            startReviewSession(deck.id);
                            navigate('/review');
                          }}
                          disabled={dueTodayCount === 0}
                        >
                          Review
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No decks created yet.</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => navigate('/decks/new')}
                >
                  Create your first deck
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;
