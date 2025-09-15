import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TLDRProps {
  content: string;
  summary: string;
}

export function TLDRSummary({ content, summary }: TLDRProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const wordCount = content.split(/\s+/).length;
  
  // Only show TL;DR for content > 120 words
  if (wordCount <= 120) {
    return <div className="prose prose-sm max-w-none">{content}</div>;
  }

  return (
    <div className="space-y-4">
      {/* TL;DR Summary */}
      <Card className="bg-flame-panel border-flame-border rounded-2xl shadow-flame-soft">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-flame-accent uppercase tracking-wide">
              TL;DR
            </span>
            <span className="text-xs text-muted-foreground">
              ({wordCount} words)
            </span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{summary}</p>
        </CardContent>
      </Card>

      {/* Expandable Full Content */}
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-muted-foreground hover:text-flame-accent hover:bg-flame-panel/50 rounded-2xl"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              Read full response
            </>
          )}
        </Button>
        
        {isExpanded && (
          <div className="prose prose-sm max-w-none animate-fade-in">
            {content}
          </div>
        )}
      </div>
    </div>
  );
}

interface ChecklistItem {
  id: string;
  text: string;
  completed?: boolean;
}

interface ChecklistProps {
  title: string;
  items: ChecklistItem[];
  onItemToggle?: (id: string) => void;
}

export function ProcedureChecklist({ title, items, onItemToggle }: ChecklistProps) {
  return (
    <Card className="bg-flame-panel border-flame-border rounded-2xl shadow-flame-soft">
      <CardContent className="p-4">
        <h4 className="font-medium text-flame-accent mb-3">{title}</h4>
        <div className="space-y-2">
          {items.map((item) => (
            <label
              key={item.id}
              className="flex items-start gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={item.completed || false}
                onChange={() => onItemToggle?.(item.id)}
                className="mt-1 rounded border-flame-border focus:ring-flame-accent focus:border-flame-accent"
              />
              <span className={`text-sm leading-relaxed transition-colors ${
                item.completed 
                  ? 'text-muted-foreground line-through' 
                  : 'text-foreground group-hover:text-flame-accent'
              }`}>
                {item.text}
              </span>
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}