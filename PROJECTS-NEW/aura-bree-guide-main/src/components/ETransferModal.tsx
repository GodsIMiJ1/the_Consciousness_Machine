import { useState } from "react";

const RECIPIENT = "pay@godsimij-ai-solutions.com";

function ref() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const r = Math.random().toString(36).slice(2,8).toUpperCase();
  return `ABREE-${y}${m}-${r}`;
}

export default function ETransferModal() {
  const [open, setOpen] = useState(false);
  const [code] = useState(ref());
  
  return (
    <>
      <button 
        onClick={() => setOpen(true)} 
        className="inline-flex items-center rounded-xl px-4 py-3 text-sm font-semibold bg-secondary text-secondary-foreground hover:opacity-90"
      >
        Pay by e-Transfer
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4">
          <div className="max-w-md w-full rounded-2xl bg-background p-6 shadow-xl space-y-4 border border-border">
            <h3 className="text-lg font-bold text-foreground">Interac e-Transfer</h3>
            <p className="text-foreground">Send <b>$9.99 CAD</b> to <b>{RECIPIENT}</b>.</p>
            <p className="text-muted-foreground text-sm">Put this code in the message field so we can credit you:</p>
            <div className="font-mono text-sm p-3 rounded bg-muted border text-center font-bold">
              {code}
            </div>
            <a
              className="underline text-sm text-primary hover:text-primary/80 block"
              href={`mailto:${RECIPIENT}?subject=AURA-BREE%20Premium%20${code}&body=I%20sent%20$9.99%20CAD%20via%20Interac%20e-Transfer.%20Reference%20Code:%20${code}`}
            >
              📧 Email confirmation (optional)
            </a>
            <div className="text-xs text-muted-foreground">
              Your premium access will be activated within 24 hours of payment confirmation.
            </div>
            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => setOpen(false)} 
                className="flex-1 px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(code);
                  alert('Reference code copied to clipboard!');
                }}
                className="px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20"
              >
                Copy Code
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
