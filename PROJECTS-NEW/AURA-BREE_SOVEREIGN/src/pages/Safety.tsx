import { useEffect } from "react";

export default function Safety() {
  useEffect(() => {
    document.title = "Safety Information | AURA-BREE";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', 'Safety information and resources for AURA-BREE.');
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-foreground mb-4">Safety Information</h1>
      <p className="text-muted-foreground mb-4">
        AURA-BREE is not a substitute for professional care. If you are in immediate danger, call your local emergency number.
      </p>
      <ul className="list-disc pl-6 text-muted-foreground space-y-2">
        <li>USA: 988 (Suicide & Crisis Lifeline)</li>
        <li>UK & ROI: Samaritans 116 123</li>
        <li>AU: Lifeline 13 11 14</li>
      </ul>
    </main>
  );
}
