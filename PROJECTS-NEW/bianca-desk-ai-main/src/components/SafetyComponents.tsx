import { AlertTriangle, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SafetyBanner() {
  return (
    <Alert className="bg-warn/10 border-warn/20 rounded-xl2 shadow-aura">
      <AlertTriangle className="h-4 w-4 text-warn" />
      <AlertDescription className="text-warn font-medium text-sm">
        <strong>Important:</strong> Bianca does not give medical advice. She cites policy and escalates to a clinician.
      </AlertDescription>
    </Alert>
  );
}

export function AuditNotice() {
  return (
    <div className="flex items-center gap-2 text-xs text-text-muted aura-card">
      <Shield className="h-3 w-3" />
      <span>All interactions are recorded in audit logs for compliance and quality assurance.</span>
    </div>
  );
}