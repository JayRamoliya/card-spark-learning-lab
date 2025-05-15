
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Search, 
  Bookmark, 
  Calendar, 
  MoreHorizontal
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import Layout from "@/components/Layout";
import { toast } from "sonner";

const DecksPage = () => {
  const navigate = useNavigate();
  const { decks, flashcards, deleteDeck } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredDecks = decks.filter((deck) => 
    deck.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    deck.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDelete = (deckId: string, deckName: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete the deck "${deckName}"? This action cannot be undone.`);
    
    if (confirmed) {
      deleteDeck(deckId);
      toast.success(`Deck "${deckName}" deleted`);
    }
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Your Decks</h1>
          <Button
            className="bg-brand-purple hover:bg-brand-purple/90"
            onClick={() => navigate('/decks/new')}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Deck
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search decks..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {filteredDecks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDecks.map((deck) => {
              const deckCards = flashcards.filter(card => card.deckId === deck.id);
              const masteredCards = deckCards.filter(card => card.ease >= 4).length;
              
              return (
                <Card key={deck.id} className="overflow-hidden">
                  <div className="h-2 bg-brand-purple" />
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                      <Bookmark className="h-5 w-5 text-brand-purple" />
                      {deck.name}
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/decks/${deck.id}`)}>
                          Edit Deck
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/decks/${deck.id}/cards`)}>
                          Manage Cards
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDelete(deck.id, deck.name)}
                        >
                          Delete Deck
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground mb-4">
                      {deck.description || "No description provided."}
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-muted-foreground">Total cards</div>
                      <div className="font-medium">{deckCards.length}</div>
                      <div className="text-muted-foreground">Mastered</div>
                      <div className="font-medium">{masteredCards} ({deckCards.length > 0 ? Math.round((masteredCards / deckCards.length) * 100) : 0}%)</div>
                      <div className="text-muted-foreground">Created</div>
                      <div className="font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3 opacity-70" /> {formatDate(deck.createdAt)}
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => navigate(`/decks/${deck.id}/cards`)}
                      >
                        Manage Cards
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-brand-purple hover:bg-brand-purple/90"
                        onClick={() => {
                          if (deckCards.length === 0) {
                            toast.info("This deck doesn't have any cards yet. Add some first!");
                          } else {
                            navigate(`/decks/${deck.id}/review`);
                          }
                        }}
                      >
                        Start Review
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              {searchTerm ? (
                <>
                  <p className="text-muted-foreground mb-2">No decks found matching "{searchTerm}"</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchTerm("")}
                  >
                    Clear search
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground mb-2">You don't have any decks yet</p>
                  <Button 
                    className="bg-brand-purple hover:bg-brand-purple/90" 
                    onClick={() => navigate('/decks/new')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create your first deck
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default DecksPage;
