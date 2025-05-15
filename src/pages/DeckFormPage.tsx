
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import Layout from "@/components/Layout";
import { toast } from "sonner";

const DeckFormPage = () => {
  const navigate = useNavigate();
  const { deckId } = useParams<{ deckId: string }>();
  const { decks, addDeck, updateDeck } = useStore();
  
  const editMode = deckId !== 'new';
  const currentDeck = decks.find(deck => deck.id === deckId);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cardsPerDay: 20,
    defaultEase: 3 as 1 | 2 | 3 | 4 | 5,
  });
  
  useEffect(() => {
    if (editMode && currentDeck) {
      setFormData({
        name: currentDeck.name,
        description: currentDeck.description,
        cardsPerDay: currentDeck.cardsPerDay,
        defaultEase: currentDeck.defaultEase,
      });
    }
  }, [editMode, currentDeck]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Deck name is required");
      return;
    }
    
    try {
      if (editMode && deckId) {
        updateDeck(deckId, {
          name: formData.name,
          description: formData.description,
          cardsPerDay: formData.cardsPerDay,
          defaultEase: formData.defaultEase,
        });
        toast.success("Deck updated successfully");
      } else {
        addDeck({
          name: formData.name,
          description: formData.description,
          cardsPerDay: formData.cardsPerDay,
          defaultEase: formData.defaultEase,
        });
        toast.success("Deck created successfully");
      }
      
      navigate('/decks');
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error(error);
    }
  };
  
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>{editMode ? "Edit Deck" : "Create New Deck"}</CardTitle>
              <CardDescription>
                {editMode 
                  ? "Update your deck information" 
                  : "Create a new flashcard deck to organize your study materials"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">Deck Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter deck name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Add a description for this deck"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="cardsPerDay">Daily Card Limit</Label>
                <Select 
                  value={formData.cardsPerDay.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, cardsPerDay: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select daily limit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 cards per day</SelectItem>
                    <SelectItem value="20">20 cards per day</SelectItem>
                    <SelectItem value="30">30 cards per day</SelectItem>
                    <SelectItem value="50">50 cards per day</SelectItem>
                    <SelectItem value="100">100 cards per day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="defaultEase">Default Difficulty</Label>
                <Select 
                  value={formData.defaultEase.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, defaultEase: parseInt(value) as 1 | 2 | 3 | 4 | 5 }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select default difficulty" />
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
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/decks')}
              >
                Cancel
              </Button>
              <Button className="bg-brand-purple hover:bg-brand-purple/90" type="submit">
                {editMode ? "Update Deck" : "Create Deck"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default DeckFormPage;
