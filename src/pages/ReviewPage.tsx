import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useStore, FlashcardDifficulty } from "@/lib/store";
import Layout from "@/components/Layout";
import CustomDatePicker from "@/components/CustomDatePicker";
import { 
  CircleSlash, 
  Clock, 
  ArrowLeft, 
  RotateCw, 
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Frown,
  Meh,
  Smile,
  Award,
  ThumbsUp,
  CalendarDays,
} from "lucide-react";

const DIFFICULTY_OPTIONS = [
  { value: 1, label: "Didn't Know", icon: Frown, color: "bg-red-500" },
  { value: 2, label: "Hard", icon: Meh, color: "bg-orange-500" },
  { value: 3, label: "Okay", icon: Smile, color: "bg-yellow-500" },
  { value: 4, label: "Easy", icon: ThumbsUp, color: "bg-green-500" },
  { value: 5, label: "Very Easy", icon: Award, color: "bg-blue-500" },
];

const ReviewPage = () => {
  const navigate = useNavigate();
  const { 
    reviewSession, 
    flashcards, 
    flipCard, 
    reviewCard, 
    nextCard, 
    startReviewSession,
    setCustomReviewDate
  } = useStore();
  
  const [isFinished, setIsFinished] = useState(false);
  const [summaryStats, setSummaryStats] = useState({
    totalReviewed: 0,
    correct: 0,
  });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  
  // Calculate progress
  const progress = reviewSession.cards.length > 0
    ? Math.round((reviewSession.currentCardIndex / reviewSession.cards.length) * 100)
    : 0;
  
  // Get current card
  const currentCardId = reviewSession.cards[reviewSession.currentCardIndex];
  const currentCard = flashcards.find(card => card.id === currentCardId);
  
  // Check if the session is complete
  useEffect(() => {
    if (reviewSession.cards.length > 0 && 
        reviewSession.currentCardIndex >= reviewSession.cards.length) {
      
      // Calculate summary stats
      const reviewed = reviewSession.cards.slice(0, reviewSession.currentCardIndex);
      const reviewedCards = reviewed.map(id => 
        flashcards.find(card => card.id === id)
      ).filter(Boolean);
      
      const correct = reviewedCards.filter(card => 
        card && card.ease && card.ease >= 3
      ).length;
      
      setSummaryStats({
        totalReviewed: reviewed.length,
        correct,
      });
      
      setIsFinished(true);
    }
  }, [reviewSession.currentCardIndex, reviewSession.cards.length, flashcards]);
  
  // Handle rating click
  const handleRate = (difficulty: FlashcardDifficulty) => {
    if (!currentCardId) return;
    
    reviewCard(currentCardId, difficulty);
    nextCard();
  };
  
  const handleCustomDateChange = (date: Date) => {
    if (!currentCardId) return;
    
    setCustomReviewDate(currentCardId, date);
    setShowCustomDatePicker(false);
    nextCard();
  };
  
  // Restart with a new session
  const handleRestartSession = () => {
    startReviewSession();
    setIsFinished(false);
  };
  
  // Exit if no review cards
  useEffect(() => {
    if (reviewSession.cards.length === 0 && !isFinished) {
      toast.info("No cards to review today!");
      navigate('/');
    }
  }, [reviewSession.cards.length, isFinished, navigate]);
  
  if (isFinished) {
    return (
      <Layout>
        <Card className="max-w-lg mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Review Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pb-6">
            <div className="flex justify-center">
              <div className="rounded-full p-6 bg-brand-lightPurple">
                <CheckCircle className="h-16 w-16 text-brand-purple" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-brand-purple">
                  {summaryStats.totalReviewed}
                </div>
                <div className="text-sm text-muted-foreground">Cards Reviewed</div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-brand-purple">
                  {summaryStats.totalReviewed > 0 
                    ? Math.round((summaryStats.correct / summaryStats.totalReviewed) * 100)
                    : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              Great job! Keep up the consistent reviews to reinforce your memory.
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline"
              className="gap-2"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button 
              className="bg-brand-purple hover:bg-brand-purple/90 gap-2"
              onClick={handleRestartSession}
            >
              <RotateCw className="h-4 w-4" />
              Start New Session
            </Button>
          </CardFooter>
        </Card>
      </Layout>
    );
  }
  
  if (!currentCard) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-12">
          <CircleSlash className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No cards to review</p>
          <Button 
            className="mt-6"
            onClick={() => navigate('/')}
          >
            Return to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            Exit Review
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {reviewSession.currentCardIndex + 1} of {reviewSession.cards.length}
            </span>
          </div>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <Card className="flex flex-col md:min-h-[400px] justify-between">
          <CardContent className="flex flex-col items-center justify-center flex-1 p-6">
            {showCustomDatePicker ? (
              <div className="w-full p-6">
                <h3 className="text-lg font-medium mb-4">Set Custom Review Date</h3>
                <CustomDatePicker
                  initialDate={currentCard.nextReview}
                  onDateChange={handleCustomDateChange}
                  label="When would you like to review this card again?"
                />
                <Button 
                  variant="outline" 
                  className="mt-4 w-full"
                  onClick={() => setShowCustomDatePicker(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div 
                className={`w-full h-full flex flex-col items-center justify-center rounded-lg p-8 transition-all duration-300 ${
                  reviewSession.showAnswer ? "bg-brand-lightPurple" : "bg-white dark:bg-gray-800 border"
                }`}
                onClick={() => flipCard()}
              >
                {!reviewSession.showAnswer ? (
                  <div className="text-center">
                    <h3 className="text-xl font-medium mb-8">{currentCard.front}</h3>
                    <p className="text-sm text-muted-foreground">Tap to reveal answer</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground mb-2">ANSWER</p>
                    <h3 className="text-xl font-medium mb-8">{currentCard.back}</h3>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 border-t p-6">
            {!showCustomDatePicker && (
              <>
                <p className="text-sm text-center text-muted-foreground w-full">
                  {reviewSession.showAnswer 
                    ? "How well did you know this?" 
                    : "Tap the card to see the answer"}
                </p>
                
                {reviewSession.showAnswer && (
                  <>
                    <div className="flex flex-wrap justify-center gap-2">
                      {DIFFICULTY_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        
                        return (
                          <Button
                            key={option.value}
                            variant="outline"
                            className={`flex flex-col items-center gap-1 h-auto py-2 min-w-[80px] ${
                              option.value === 3 ? "border-yellow-500" : ""
                            }`}
                            onClick={() => handleRate(option.value as FlashcardDifficulty)}
                          >
                            <div className={`w-8 h-8 rounded-full ${option.color} flex items-center justify-center`}>
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xs">{option.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 mt-2"
                      onClick={() => setShowCustomDatePicker(true)}
                    >
                      <CalendarDays className="h-4 w-4" />
                      Set Custom Date
                    </Button>
                  </>
                )}
              </>
            )}
            
            <div className="flex justify-between w-full pt-2">
              <Button
                variant="ghost"
                size="icon"
                disabled={reviewSession.currentCardIndex === 0}
                onClick={() => navigate('/')}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (showCustomDatePicker) {
                    setShowCustomDatePicker(false);
                  } else if (reviewSession.showAnswer) {
                    nextCard();
                  } else {
                    flipCard();
                  }
                }}
              >
                {reviewSession.showAnswer 
                  ? <ChevronRight className="h-5 w-5" /> 
                  : <RotateCw className="h-5 w-5" />
                }
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default ReviewPage;
