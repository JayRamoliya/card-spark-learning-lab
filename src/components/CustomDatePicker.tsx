import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface CustomDatePickerProps {
  initialDate: Date;
  onDateChange: (date: Date) => void;
  label?: string;
  showTimeSelect?: boolean;
}

const CustomDatePicker = ({ 
  initialDate, 
  onDateChange, 
  label = "Set review date",
  showTimeSelect = false
}: CustomDatePickerProps) => {
  const [date, setDate] = useState<Date>(initialDate);
  const [time, setTime] = useState<string>(
    format(initialDate, "HH:mm")
  );

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      
      if (showTimeSelect) {
        // Keep the time component the same
        const [hours, minutes] = time.split(':').map(Number);
        newDate.setHours(hours, minutes);
      }
      
      setDate(newDate);
      onDateChange(newDate);
      toast.success("Review date updated successfully");
    }
  };
  
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);
    
    // Update the existing date with the new time
    const newDate = new Date(date);
    const [hours, minutes] = newTime.split(':').map(Number);
    newDate.setHours(hours, minutes);
    
    setDate(newDate);
    onDateChange(newDate);
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
      <div className="flex flex-col gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        
        {showTimeSelect && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Input 
              type="time"
              value={time}
              onChange={handleTimeChange}
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomDatePicker;
