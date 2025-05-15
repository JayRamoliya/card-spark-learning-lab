
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { LineChart, BarChart, PieChart } from "@/components/ui/chart";
import Layout from "@/components/Layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  Calendar,
  Clock,
  Star,
  TrendingUp,
  Award,
  BarChart4,
  PieChart as PieChartIcon,
} from "lucide-react";
import { useState } from "react";

interface ChartData {
  name: string;
  value: number;
}

const StatsPage = () => {
  const { stats, flashcards, decks } = useStore();
  const [selectedDeck, setSelectedDeck] = useState<string>("all");
  
  // Get cards from selected deck or all cards
  const relevantCards = selectedDeck === "all" 
    ? flashcards 
    : flashcards.filter(card => card.deckId === selectedDeck);
  
  // Filter out cards that haven't been reviewed
  const reviewedCards = relevantCards.filter(card => card.lastReviewed);
  
  // Calculate time spent (estimate: 10 seconds per card)
  const timeSpentSeconds = stats.totalReviewed * 10;
  const hours = Math.floor(timeSpentSeconds / 3600);
  const minutes = Math.floor((timeSpentSeconds % 3600) / 60);
  
  // Calculate retention rate
  const knownCards = reviewedCards.filter(card => card.ease >= 3).length;
  const unknownCards = reviewedCards.length - knownCards;
  
  const retentionData = [
    { name: "Known", value: knownCards },
    { name: "Unknown", value: unknownCards },
  ];
  
  // Ease score breakdown
  const easeDistribution = [1, 2, 3, 4, 5].map(ease => {
    return {
      name: ease.toString(),
      value: reviewedCards.filter(card => card.ease === ease).length,
    };
  });
  
  // Review history data - last 14 days
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();
  
  const reviewHistoryData = last14Days.map(date => {
    const entry = stats.history.find(h => h.date === date);
    return {
      name: date.split('-')[2], // Just the day
      total: entry?.reviewed || 0,
    };
  });
  
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Learning Statistics</h1>
            <p className="text-muted-foreground">
              Track your progress and memory retention
            </p>
          </div>
          
          <Select
            value={selectedDeck}
            onValueChange={setSelectedDeck}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select deck" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Decks</SelectItem>
              {decks.map(deck => (
                <SelectItem key={deck.id} value={deck.id}>
                  {deck.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-brand-purple" />
                Study Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.streakDays} days</div>
              <p className="text-xs text-muted-foreground">
                Consecutive days of learning
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-500" />
                Cards Reviewed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReviewed}</div>
              <p className="text-xs text-muted-foreground">
                Total reviews completed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                Time Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {hours > 0 ? `${hours}h ` : ""}
                {minutes}m
              </div>
              <p className="text-xs text-muted-foreground">
                Estimated study time
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Retention Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reviewedCards.length === 0 
                  ? "N/A" 
                  : `${Math.round((knownCards / reviewedCards.length) * 100)}%`
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Cards marked as known
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-brand-purple" />
                Review History
              </CardTitle>
              <CardDescription>
                Number of cards reviewed over the last 14 days
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <LineChart
                data={reviewHistoryData}
                categories={["total"]}
                colors={["#8B5CF6"]}
                valueFormatter={(value) => `${value} cards`}
                showLegend={false}
                showXAxis={true}
                showYAxis={true}
                yAxisWidth={30}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-brand-purple" />
                Retention Rate
              </CardTitle>
              <CardDescription>
                Percentage of cards you know vs don't know
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {reviewedCards.length > 0 ? (
                <PieChart
                  data={retentionData}
                  category="value"
                  index="name"
                  colors={["#4ADE80", "#F87171"]}
                  valueFormatter={(value) => `${value} cards`}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No review data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart4 className="h-5 w-5 text-brand-purple" />
              Difficulty Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of card difficulty ratings
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {reviewedCards.length > 0 ? (
              <BarChart
                data={easeDistribution}
                categories={["value"]}
                index="name"
                colors={["#8B5CF6"]}
                valueFormatter={(value) => `${value} cards`}
                showLegend={false}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No difficulty data available
              </div>
            )}
          </CardContent>
        </Card>
        
        {selectedDeck !== "all" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-brand-purple" />
                Most Difficult Cards
              </CardTitle>
              <CardDescription>
                Cards with the lowest ease scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {relevantCards.length > 0 ? (
                <div className="space-y-2">
                  {relevantCards
                    .filter(card => card.lastReviewed)
                    .sort((a, b) => a.ease - b.ease)
                    .slice(0, 5)
                    .map(card => (
                      <div key={card.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <div className="font-medium">{card.front}</div>
                          <div className="text-sm">
                            Difficulty: {6 - card.ease}/5
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">{card.back}</div>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No cards to show
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default StatsPage;
