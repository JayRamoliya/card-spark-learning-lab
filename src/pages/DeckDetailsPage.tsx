
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription, 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Plus, 
  Pencil, 
  Trash2, 
  Search,
  ClipboardCheck,
  BarChart,
  Calendar,
  Clock,
  RotateCcw,
} from "lucide-react";
import { useStore } from "@/lib/store";
import Layout from "@/components/Layout";
import { FlashcardDifficulty } from "@/lib/store";

// Helper to format date
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString();
};

// Helper to get ease label
const getEaseLabel = (ease: FlashcardDifficulty) => {
  switch (ease) {
    case 1: return { label: "Very Hard", color: "text-red-500" };
    case 2: return { label: "Hard", color: "text-orange-500" };
    case 3: return { label: "Medium", color: "text-yellow-500" };
    case 4: return { label: "Easy", color: "text-green-500" };
    case 5: return { label: "Very Easy", color: "text-blue-500" };
    default: return { label: "Unknown", color: "text-gray-500" };
  }
};

const DeckDetailsPage = () => {
  const navigate = useNavigate();
  const { deckId } = useParams<{ deckId: string }>();
  
  const { decks, flashcards, addFlashcard, updateFlashcard, deleteFlashcard } = useStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentFlashcard, setCurrentFlashcard] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    front: "",
    back: "",
    ease: 3 as FlashcardDifficulty,
    tags: "",
  });
  
  const currentDeck = decks.find(deck => deck.id === deckId);
  const deckFlashcards = flashcards.filter(card => card.deckId === deckId);
  
  const filteredCards = deckFlashcards.filter(card => 
    card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.back.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!isAddDialogOpen && !isEditDialogOpen) {
      setFormData({
        front: "",
        back: "",
        ease: 3,
        tags: "",
      });
      setCurrentFlashcard(null);
    }
  }, [isAddDialogOpen, isEditDialogOpen]);
  
  // Load flashcard data when editing
  useEffect(() => {
    if (currentFlashcard && isEditDialogOpen) {
      const card = flashcards.find(c => c.id === currentFlashcard);
      if (card) {
        setFormData({
          front: card.front,
          back: card.back,
          ease: card.ease,
          tags: card.tags?.join(", ") || "",
        });
      }
    }
  }, [currentFlashcard, isEditDialogOpen, flashcards]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.front.trim() || !formData.back.trim()) {
      toast.error("Front and back content is required");
      return;
    }
    
    try {
      // Format tags
      const formattedTags = formData.tags
        ? formData.tags.split(",").map(tag => tag.trim()).filter(Boolean)
        : undefined;
      
      if (isEditDialogOpen && currentFlashcard) {
        // Edit existing card
        updateFlashcard(currentFlashcard, {
          front: formData.front,
          back: formData.back,
          ease: formData.ease,
          tags: formattedTags,
        });
        toast.success("Flashcard updated successfully");
      } else {
        // Add new card
        if (!deckId) {
          toast.error("Deck ID is missing");
          return;
        }
        
        addFlashcard({
          deckId,
          front: formData.front,
          back: formData.back,
          ease: formData.ease,
          tags: formattedTags,
        });
        toast.success("Flashcard created successfully");
      }
      
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error(error);
    }
  };
  
  const handleDelete = (cardId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this flashcard?");
    
    if (confirmed) {
      deleteFlashcard(cardId);
      toast.success("Flashcard deleted");
    }
  };
  
  if (!currentDeck) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Deck not found</p>
          <Button className="mt-4" onClick={() => navigate('/decks')}>
            Go back to all decks
          </Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate('/decks')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{currentDeck.name}</h1>
            <p className="text-muted-foreground">{currentDeck.description || "No description provided"}</p>
          </div>
        </div>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-brand-purple" />
              Deck Statistics
            </CardTitle>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => navigate(`/decks/${deckId}/edit`)}
            >
              <Pencil className="h-4 w-4" />
              Edit Deck
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <BarChart className="h-4 w-4" /> Total Cards
                </span>
                <span className="text-2xl font-bold">{deckFlashcards.length}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> Created On
                </span>
                <span className="text-lg">{formatDate(currentDeck.createdAt)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <RotateCcw className="h-4 w-4" /> Daily Limit
                </span>
                <span className="text-lg">{currentDeck.cardsPerDay} cards</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" /> Cards Due Today
                </span>
                <span className="text-lg">
                  {flashcards.filter(card => 
                    card.deckId === deckId && 
                    new Date(card.nextReview) <= new Date()
                  ).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search flashcards..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-purple hover:bg-brand-purple/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Flashcard
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Flashcard</DialogTitle>
                <DialogDescription>
                  Create a new flashcard for this deck. Make sure to include clear content on both sides.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="front">Front (Question)</Label>
                  <Textarea
                    id="front"
                    name="front"
                    placeholder="Question or term"
                    rows={3}
                    value={formData.front}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="back">Back (Answer)</Label>
                  <Textarea
                    id="back"
                    name="back"
                    placeholder="Answer or definition"
                    rows={3}
                    value={formData.back}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ease">Difficulty</Label>
                    <Select 
                      value={formData.ease.toString()} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, ease: parseInt(value) as FlashcardDifficulty }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Very Hard</SelectItem>
                        <SelectItem value="2">Hard</SelectItem>
                        <SelectItem value="3">Medium</SelectItem>
                        <SelectItem value="4">Easy</SelectItem>
                        <SelectItem value="5">Very Easy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      name="tags"
                      placeholder="e.g. math, algebra"
                      value={formData.tags}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-brand-purple hover:bg-brand-purple/90" type="submit">
                    Add Flashcard
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Flashcard</DialogTitle>
                <DialogDescription>
                  Update this flashcard's content or properties.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="front">Front (Question)</Label>
                  <Textarea
                    id="front"
                    name="front"
                    placeholder="Question or term"
                    rows={3}
                    value={formData.front}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="back">Back (Answer)</Label>
                  <Textarea
                    id="back"
                    name="back"
                    placeholder="Answer or definition"
                    rows={3}
                    value={formData.back}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ease">Difficulty</Label>
                    <Select 
                      value={formData.ease.toString()} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, ease: parseInt(value) as FlashcardDifficulty }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Very Hard</SelectItem>
                        <SelectItem value="2">Hard</SelectItem>
                        <SelectItem value="3">Medium</SelectItem>
                        <SelectItem value="4">Easy</SelectItem>
                        <SelectItem value="5">Very Easy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      name="tags"
                      placeholder="e.g. math, algebra"
                      value={formData.tags}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-brand-purple hover:bg-brand-purple/90" type="submit">
                    Update Flashcard
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{filteredCards.length} Flashcards</CardTitle>
            <CardDescription>
              {searchTerm 
                ? `Showing results for "${searchTerm}"` 
                : "All flashcards in this deck"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredCards.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{ width: "40%" }}>Front</TableHead>
                      <TableHead style={{ width: "40%" }}>Back</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Next Review</TableHead>
                      <TableHead style={{ width: "100px" }}>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCards.map((card) => {
                      const { label, color } = getEaseLabel(card.ease);
                      
                      return (
                        <TableRow key={card.id}>
                          <TableCell className="font-medium">{card.front}</TableCell>
                          <TableCell>{card.back}</TableCell>
                          <TableCell>
                            <span className={color}>{label}</span>
                          </TableCell>
                          <TableCell>{formatDate(card.nextReview)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setCurrentFlashcard(card.id);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDelete(card.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                {searchTerm ? (
                  <>
                    <p className="text-muted-foreground mb-2">No flashcards found matching "{searchTerm}"</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchTerm("")}
                    >
                      Clear search
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground mb-2">No flashcards in this deck yet</p>
                    <Button 
                      className="bg-brand-purple hover:bg-brand-purple/90"
                      onClick={() => setIsAddDialogOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add your first flashcard
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DeckDetailsPage;
