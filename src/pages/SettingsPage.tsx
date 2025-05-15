
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import Layout from "@/components/Layout";
import { 
  Save, 
  Download, 
  Upload, 
  Trash2, 
  RotateCcw,
  User,
  AlarmClock,
  Calendar,
  Settings2,
  FileJson,
  Moon,
  Sun,
  Database
} from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";

const SettingsPage = () => {
  const { settings, updateSettings, resetProgress } = useStore();
  const [theme, setTheme] = useLocalStorage<"light" | "dark">("theme", "light");
  const [formData, setFormData] = useState({
    userName: "",
    dailyCardLimit: 20,
    newCardLimit: 10,
    reminderTime: "19:00",
    dataRetentionDays: 15
  });
  
  // Initialize form with current settings
  useEffect(() => {
    setFormData({
      userName: settings.userName,
      dailyCardLimit: settings.dailyCardLimit,
      newCardLimit: settings.newCardLimit,
      reminderTime: settings.reminderTime,
      dataRetentionDays: settings.dataRetentionDays || 15
    });
  }, [settings]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      updateSettings({
        userName: formData.userName,
        dailyCardLimit: Number(formData.dailyCardLimit),
        newCardLimit: Number(formData.newCardLimit),
        reminderTime: formData.reminderTime,
        dataRetentionDays: Number(formData.dataRetentionDays)
      });
      
      toast.success("Settings updated successfully");
    } catch (error) {
      toast.error("Failed to update settings");
      console.error(error);
    }
  };
  
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    
    // Update document classes
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(newTheme);
  };
  
  // Handle data export
  const handleExportData = () => {
    try {
      const state = localStorage.getItem('flashcard-app-storage');
      
      if (!state) {
        toast.error("No data to export");
        return;
      }
      
      const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(state)}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `flashcard-data-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      
      toast.success("Data exported successfully");
    } catch (error) {
      toast.error("Failed to export data");
      console.error(error);
    }
  };
  
  // Handle data import
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const jsonData = event.target?.result as string;
          localStorage.setItem('flashcard-app-storage', jsonData);
          
          toast.success("Data imported successfully. Please refresh the page.");
          
          // Force reload to apply imported data
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } catch (parseError) {
          toast.error("Invalid data format");
          console.error(parseError);
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      toast.error("Failed to import data");
      console.error(error);
    }
  };
  
  // Handle data reset
  const handleResetData = () => {
    resetProgress();
    toast.success("All progress has been reset");
  };
  
  return (
    <Layout>
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight dark:text-white">Settings</h1>
          <p className="text-muted-foreground">
            Customize your flashcard experience
          </p>
        </div>
        
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <User className="h-5 w-5 text-brand-purple" />
                User Settings
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Personalize your account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="userName" className="dark:text-white">Your Name</Label>
                <Input
                  id="userName"
                  name="userName"
                  placeholder="Enter your name"
                  value={formData.userName}
                  onChange={handleChange}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto flex items-center gap-2 bg-brand-purple hover:bg-brand-purple/90" type="submit">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Moon className="h-5 w-5 text-brand-purple" />
              Appearance
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Change how FlashMaster looks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4">
              <Label className="dark:text-white">Theme</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={theme === "light" ? "default" : "outline"}
                  className={`flex items-center gap-2 ${theme === "light" ? "bg-brand-purple hover:bg-brand-purple/90" : "dark:bg-gray-700 dark:text-white"}`}
                  onClick={() => theme !== "light" && toggleTheme()}
                >
                  <Sun className="h-4 w-4" />
                  Light
                </Button>
                <Button
                  type="button"
                  variant={theme === "dark" ? "default" : "outline"}
                  className={`flex items-center gap-2 ${theme === "dark" ? "bg-brand-purple hover:bg-brand-purple/90" : "dark:bg-gray-700 dark:text-white"}`}
                  onClick={() => theme !== "dark" && toggleTheme()}
                >
                  <Moon className="h-4 w-4" />
                  Dark
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Settings2 className="h-5 w-5 text-brand-purple" />
              Study Preferences
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Configure your learning session settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="dailyCardLimit" className="dark:text-white">Daily Card Limit</Label>
              <Select 
                value={formData.dailyCardLimit.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, dailyCardLimit: parseInt(value) }))}
              >
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select daily limit" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="10">10 cards per day</SelectItem>
                  <SelectItem value="20">20 cards per day</SelectItem>
                  <SelectItem value="30">30 cards per day</SelectItem>
                  <SelectItem value="50">50 cards per day</SelectItem>
                  <SelectItem value="100">100 cards per day</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1 dark:text-gray-400">
                Maximum number of cards to review each day
              </p>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="newCardLimit" className="dark:text-white">New Card Limit</Label>
              <Select 
                value={formData.newCardLimit.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, newCardLimit: parseInt(value) }))}
              >
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select new card limit" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="5">5 new cards per day</SelectItem>
                  <SelectItem value="10">10 new cards per day</SelectItem>
                  <SelectItem value="15">15 new cards per day</SelectItem>
                  <SelectItem value="20">20 new cards per day</SelectItem>
                  <SelectItem value="30">30 new cards per day</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1 dark:text-gray-400">
                Maximum number of new cards to introduce each day
              </p>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="reminderTime" className="dark:text-white">Daily Reminder Time</Label>
              <Input
                id="reminderTime"
                name="reminderTime"
                type="time"
                value={formData.reminderTime}
                onChange={handleChange}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="text-xs text-muted-foreground mt-1 dark:text-gray-400">
                When to receive daily study reminders (if enabled in your browser)
              </p>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="dataRetentionDays" className="dark:text-white">Data Retention (Days)</Label>
              <Select 
                value={formData.dataRetentionDays.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, dataRetentionDays: parseInt(value) }))}
              >
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select data retention period" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="15">15 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1 dark:text-gray-400">
                How long to keep detailed review history data
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="ml-auto flex items-center gap-2 bg-brand-purple hover:bg-brand-purple/90" 
              onClick={handleSubmit}
            >
              <Save className="h-4 w-4" />
              Save Preferences
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <FileJson className="h-5 w-5 text-brand-purple" />
              Data Management
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Export, import, or reset your flashcard data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-medium flex items-center gap-2 dark:text-white">
                  <Download className="h-4 w-4" /> Export Data
                </h3>
                <p className="text-sm text-muted-foreground my-2 dark:text-gray-400">
                  Download all your flashcards and progress as a JSON file
                </p>
                <Button 
                  variant="outline" 
                  className="w-full dark:bg-gray-800 dark:text-white dark:hover:bg-gray-900"
                  onClick={handleExportData}
                >
                  Export to JSON
                </Button>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-medium flex items-center gap-2 dark:text-white">
                  <Upload className="h-4 w-4" /> Import Data
                </h3>
                <p className="text-sm text-muted-foreground my-2 dark:text-gray-400">
                  Restore from a previously exported backup file
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    id="importFile"
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImportData}
                  />
                  <label htmlFor="importFile" className="w-full">
                    <Button 
                      variant="outline" 
                      className="w-full dark:bg-gray-800 dark:text-white dark:hover:bg-gray-900" 
                      onClick={() => document.getElementById("importFile")?.click()}
                    >
                      Import from JSON
                    </Button>
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Irreversible actions that will delete your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-lg">
              <h3 className="font-medium dark:text-white">Reset All Progress</h3>
              <p className="text-sm text-muted-foreground my-2 dark:text-gray-400">
                This will delete all your flashcards, decks, and progress statistics. This action cannot be undone.
              </p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="mt-2">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="dark:text-white">Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="dark:text-gray-400">
                      This action will permanently delete all your flashcards, decks, and learning progress.
                      This action cannot be reversed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleResetData}
                      className="bg-red-500 text-white hover:bg-red-600"
                    >
                      Reset Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SettingsPage;
