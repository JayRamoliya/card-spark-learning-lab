
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export type FlashcardDifficulty = 1 | 2 | 3 | 4 | 5;

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  ease: FlashcardDifficulty;
  interval: number; // Days until next review
  nextReview: Date;
  lastReviewed?: Date;
  createdAt: Date;
  tags?: string[];
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  cardsPerDay: number;
  defaultEase: FlashcardDifficulty;
}

export interface Stats {
  streakDays: number;
  lastReviewDate?: Date;
  cardsReviewedToday: number;
  totalReviewed: number;
  history: {
    date: string;
    reviewed: number;
    correct: number;
  }[];
}

interface AppState {
  decks: Deck[];
  flashcards: Flashcard[];
  stats: Stats;
  settings: {
    dailyCardLimit: number;
    newCardLimit: number;
    reminderTime: string;
    userName: string;
  };
  currentDeck?: string;
  reviewSession: {
    cards: string[];
    currentCardIndex: number;
    showAnswer: boolean;
  };
  
  // Actions
  addDeck: (deck: Omit<Deck, 'id' | 'createdAt'>) => void;
  updateDeck: (deckId: string, updates: Partial<Deck>) => void;
  deleteDeck: (deckId: string) => void;
  
  addFlashcard: (card: Omit<Flashcard, 'id' | 'createdAt' | 'nextReview' | 'interval'>) => void;
  updateFlashcard: (cardId: string, updates: Partial<Flashcard>) => void;
  deleteFlashcard: (cardId: string) => void;
  
  startReviewSession: (deckId?: string) => void;
  reviewCard: (cardId: string, performance: FlashcardDifficulty) => void;
  flipCard: () => void;
  nextCard: () => void;
  
  updateSettings: (settings: Partial<AppState['settings']>) => void;
  updateStats: (stats: Partial<AppState['stats']>) => void;
  resetProgress: () => void;
}

// Helper function to calculate next review date
const calculateNextReview = (ease: FlashcardDifficulty, currentInterval: number): number => {
  switch(ease) {
    case 1: // Didn't know
      return 1;
    case 2: // Hard
      return Math.max(1, Math.floor(currentInterval * 1.2));
    case 3: // Okay
      return Math.max(1, Math.floor(currentInterval * 1.5));
    case 4: // Easy
      return Math.max(1, Math.floor(currentInterval * 2));
    case 5: // Very Easy
      return Math.max(1, Math.floor(currentInterval * 2.5));
    default:
      return 1;
  }
};

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Initial state
const initialState = {
  decks: [],
  flashcards: [],
  stats: {
    streakDays: 0,
    cardsReviewedToday: 0,
    totalReviewed: 0,
    history: []
  },
  settings: {
    dailyCardLimit: 20,
    newCardLimit: 10,
    reminderTime: '19:00',
    userName: 'Learner'
  },
  reviewSession: {
    cards: [],
    currentCardIndex: 0,
    showAnswer: false
  }
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      addDeck: (deck) => set((state) => ({
        decks: [
          ...state.decks,
          {
            ...deck,
            id: generateId(),
            createdAt: new Date()
          }
        ]
      })),
      
      updateDeck: (deckId, updates) => set((state) => ({
        decks: state.decks.map(deck => 
          deck.id === deckId ? { ...deck, ...updates } : deck
        )
      })),
      
      deleteDeck: (deckId) => set((state) => ({
        decks: state.decks.filter(deck => deck.id !== deckId),
        flashcards: state.flashcards.filter(card => card.deckId !== deckId)
      })),
      
      addFlashcard: (card) => {
        const today = new Date();
        const nextReview = new Date(today);
        nextReview.setDate(today.getDate() + 1); // Initially review the next day
        
        set((state) => ({
          flashcards: [
            ...state.flashcards,
            {
              ...card,
              id: generateId(),
              createdAt: today,
              nextReview,
              interval: 1
            }
          ]
        }));
      },
      
      updateFlashcard: (cardId, updates) => set((state) => ({
        flashcards: state.flashcards.map(card => 
          card.id === cardId ? { ...card, ...updates } : card
        )
      })),
      
      deleteFlashcard: (cardId) => set((state) => ({
        flashcards: state.flashcards.filter(card => card.id !== cardId)
      })),
      
      startReviewSession: (deckId) => {
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today
        
        const { flashcards, settings } = get();
        
        // Filter cards due today & from specific deck if provided
        const dueCards = flashcards
          .filter(card => {
            const isDue = new Date(card.nextReview) <= today;
            return deckId ? (isDue && card.deckId === deckId) : isDue;
          })
          .map(card => card.id)
          .slice(0, settings.dailyCardLimit);
        
        set({
          reviewSession: {
            cards: dueCards,
            currentCardIndex: 0,
            showAnswer: false
          },
          currentDeck: deckId
        });
      },
      
      reviewCard: (cardId, performance) => {
        const { flashcards } = get();
        const card = flashcards.find(c => c.id === cardId);
        
        if (!card) return;
        
        const today = new Date();
        const newInterval = calculateNextReview(performance, card.interval);
        const nextReview = new Date(today);
        nextReview.setDate(today.getDate() + newInterval);
        
        // Update the card
        set((state) => ({
          flashcards: state.flashcards.map(c => 
            c.id === cardId 
              ? { 
                  ...c, 
                  ease: performance,
                  interval: newInterval,
                  nextReview,
                  lastReviewed: today
                } 
              : c
          ),
          stats: {
            ...state.stats,
            cardsReviewedToday: state.stats.cardsReviewedToday + 1,
            totalReviewed: state.stats.totalReviewed + 1,
            lastReviewDate: today,
            // Update streak here based on dates
            streakDays: getUpdatedStreak(state.stats.lastReviewDate, state.stats.streakDays),
            history: updateReviewHistory(state.stats.history, performance)
          }
        }));
      },
      
      flipCard: () => set((state) => ({
        reviewSession: {
          ...state.reviewSession,
          showAnswer: !state.reviewSession.showAnswer
        }
      })),
      
      nextCard: () => set((state) => ({
        reviewSession: {
          ...state.reviewSession,
          currentCardIndex: state.reviewSession.currentCardIndex + 1,
          showAnswer: false
        }
      })),
      
      updateSettings: (newSettings) => set((state) => ({
        settings: {
          ...state.settings,
          ...newSettings
        }
      })),
      
      updateStats: (newStats) => set((state) => ({
        stats: {
          ...state.stats,
          ...newStats
        }
      })),
      
      resetProgress: () => set((state) => ({
        ...initialState,
        settings: state.settings // Preserve user settings
      }))
    }),
    {
      name: 'flashcard-app-storage'
    }
  )
);

// Helper for streak calculation
function getUpdatedStreak(lastDate?: Date, currentStreak = 0): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!lastDate) return 1; // First review
  
  const lastReviewDate = new Date(lastDate);
  lastReviewDate.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  if (lastReviewDate.getTime() === yesterday.getTime()) {
    return currentStreak + 1; // Continue streak
  } else if (lastReviewDate.getTime() === today.getTime()) {
    return currentStreak; // Already reviewed today
  } else {
    return 1; // Streak broken, start new
  }
}

// Helper for review history
function updateReviewHistory(history: any[], performance: FlashcardDifficulty) {
  const today = new Date().toISOString().split('T')[0];
  const isCorrect = performance >= 3; // Consider 3+ as "correct"
  
  const existingEntry = history.find(h => h.date === today);
  
  if (existingEntry) {
    return history.map(h => 
      h.date === today 
        ? { 
            ...h, 
            reviewed: h.reviewed + 1,
            correct: h.correct + (isCorrect ? 1 : 0)
          }
        : h
    );
  } else {
    return [
      ...history,
      {
        date: today,
        reviewed: 1,
        correct: isCorrect ? 1 : 0
      }
    ];
  }
}
