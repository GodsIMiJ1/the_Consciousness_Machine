import { AlertCircle, WifiOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface FlameRouterErrorProps {
  onRetry?: () => void;
  errorType?: 'connection' | 'timeout' | 'server' | 'unknown';
}

export function FlameRouterError({ onRetry, errorType = 'connection' }: FlameRouterErrorProps) {
  const getErrorContent = () => {
    switch (errorType) {
      case 'connection':
        return {
          icon: <WifiOff className="h-4 w-4" />,
          title: "FlameRouter Unreachable",
          description: "Cannot connect to the AI routing service. Please check your connection and try again."
        };
      case 'timeout':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          title: "Request Timeout",
          description: "The AI service is taking longer than expected. Please try again in a moment."
        };
      case 'server':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          title: "Service Unavailable",
          description: "The AI service is currently experiencing issues. Our team has been notified."
        };
      default:
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          title: "AI Service Error",
          description: "An unexpected error occurred. Please try again or contact support if the issue persists."
        };
    }
  };

  const { icon, title, description } = getErrorContent();

  return (
    <Alert className="bg-destructive/10 border-destructive/20 rounded-2xl shadow-flame-soft">
      {icon}
      <AlertTitle className="text-destructive">{title}</AlertTitle>
      <AlertDescription className="text-destructive/80 mb-3">
        {description}
      </AlertDescription>
      {onRetry && (
        <Button 
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="bg-destructive/10 border-destructive/30 text-destructive hover:bg-destructive/20 rounded-2xl"
        >
          Try Again
        </Button>
      )}
    </Alert>
  );
}