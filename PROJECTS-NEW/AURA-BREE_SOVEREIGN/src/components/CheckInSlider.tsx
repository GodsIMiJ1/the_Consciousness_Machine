import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Slider } from "./ui/slider";
import { Save } from "lucide-react";

interface CheckInSliderProps {
  onSave: (score: number, note?: string) => void;
}

export default function CheckInSlider({ onSave }: CheckInSliderProps) {
  const [score, setScore] = useState([7]);
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(score[0], note.trim() || undefined);
      setNote(""); // Clear note after saving
    } finally {
      setIsSaving(false);
    }
  };

  const getMoodLabel = (value: number) => {
    if (value <= 2) return "Very Low";
    if (value <= 4) return "Low";
    if (value <= 6) return "Okay";
    if (value <= 8) return "Good";
    return "Excellent";
  };

  const getMoodColor = (value: number) => {
    if (value <= 2) return "text-red-400";
    if (value <= 4) return "text-orange-400";
    if (value <= 6) return "text-yellow-400";
    if (value <= 8) return "text-primary-glow";
    return "text-primary";
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          How are you feeling today?
        </h3>
        
        <div className="space-y-6">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>1 - Very Low</span>
            <span>10 - Excellent</span>
          </div>
          
          <Slider
            value={score}
            onValueChange={setScore}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
          
          <div className="text-center">
            <span className={`text-3xl font-bold ${getMoodColor(score[0])}`}>
              {score[0]}
            </span>
            <p className={`text-lg ${getMoodColor(score[0])}`}>
              {getMoodLabel(score[0])}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Optional notes (how you're feeling, what's on your mind...)
        </label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Today I feel... because..."
          className="resize-none"
          rows={3}
        />
      </div>

      <Button 
        onClick={handleSave}
        disabled={isSaving}
        className="w-full bg-gradient-flame hover:bg-gradient-flame hover:opacity-90 text-white font-medium py-3"
      >
        <Save className="w-4 h-4 mr-2" />
        {isSaving ? "Saving..." : "Save Check-In"}
      </Button>
    </div>
  );
}