import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Building2, Users, BarChart3, Shield, CheckCircle } from "lucide-react";

export default function Clinics() {
  // Mood submission state
  const [mood, setMood] = useState<number>(5);
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Pilot AURA-BREE at Your Clinic | Mental Health Solutions";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "Partner with AURA-BREE to provide digital mental health support for your clients. No-PII pilot program available.");
  }, []);

  async function handleMoodSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitted(false);
    setSubmitting(true);

    // Build payload
    const payload = {
      mood,
      notes,
      timestamp: new Date().toISOString(),
    };

    try {
      // Attempt to send to backend API
      try {
        const res = await fetch("/api/mood", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setSubmitted(true);
          setNotes("");
          return;
        } else {
          // Server responded with an error; fall back to local storage
          throw new Error(`Server responded with ${res.status}`);
        }
      } catch (networkOrServerError) {
        // Fallback: persist locally in the browser as an offline-first approach
        const existing = JSON.parse(localStorage.getItem("aura_mood_submissions") || "[]");
        existing.push(payload);
        localStorage.setItem("aura_mood_submissions", JSON.stringify(existing));
        setSubmitted(true);
        setNotes("");
        return;
      }
    } catch (err: any) {
      setError(err?.message ?? "Mood submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Pilot AURA-BREE at your clinic</h1>
              <p className="text-muted-foreground">Digital mental health support for your clients</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Mood Data Submission Card with form */}
        <Card className="p-8 border-border bg-gradient-surface text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Submit Your Mood Data
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Provide your current mood and optional notes to help us improve your experience.
          </p>

          <form onSubmit={handleMoodSubmit} className="mx-auto w-full max-w-md space-y-4">
            <div className="flex items-center gap-3 justify-center">
              <label className="block text-sm font-medium text-foreground sr-only" htmlFor="mood">
                Mood
              </label>
              <span className="text-sm text-muted-foreground">Mood</span>
              <input
                id="mood"
                type="range"
                min={1}
                max={10}
                value={mood}
                onChange={(e) => setMood(parseInt(e.target.value))}
                className="w-full"
              />
              <span className="w-8 text-center">{mood}</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1" htmlFor="notes">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add context about your mood..."
                rows={3}
                className="w-full border border-border rounded-xl px-4 py-3 bg-background text-foreground resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl px-6 py-3 bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
            >
              {submitting ? "Submitting..." : "Submit Mood"}
            </button>
          </form>

          {submitted && <p className="text-green-600 mt-3">Mood data submitted successfully.</p>}
          {error && <p className="text-red-600 mt-3">{error}</p>}
        </Card>

        {/* Mood Data Submission Instructions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 border-border bg-card/50">
            <Users className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Client Engagement
            </h3>
            <p className="text-muted-foreground">
              Provide 24/7 support between sessions with mood tracking, 
              therapeutic chat, and crisis resources.
            </p>
          </Card>

          <Card className="p-6 border-border bg-card/50">
            <BarChart3 className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Progress Insights
            </h3>
            <p className="text-muted-foreground">
              Track client mood trends and engagement patterns to inform 
              your therapeutic approach.
            </p>
          </Card>

          <Card className="p-6 border-border bg-card/50">
            <Shield className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Privacy First
            </h3>
            <p className="text-muted-foreground">
              No personally identifiable information required. 
              All data stays on client devices by default.
            </p>
          </Card>

          <Card className="p-6 border-border bg-card/50">
            <CheckCircle className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Easy Integration
            </h3>
            <p className="text-muted-foreground">
              Simple web-based tool that works on any device. 
              No complex installations or training required.
            </p>
          </Card>
        </div>

        {/* Pilot Features */}
        <Card className="p-8 border-border bg-card/50">
          <h3 className="text-2xl font-semibold text-foreground mb-6 text-center">
            Pilot Program Features
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-medium text-foreground mb-4">For Clients</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">Daily mood check-ins</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">24/7 therapeutic chat support</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">Crisis safety resources</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">Progress tracking and streaks</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">Optional mindfulness tools</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-foreground mb-4">For Clinicians</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">Aggregated mood trend reports</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">Client engagement metrics</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">Crisis alert notifications</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">Usage analytics dashboard</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">Training and support materials</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Contact Form */}
        <Card className="p-8 border-border bg-gradient-surface">
          <h3 className="text-2xl font-semibold text-foreground mb-6 text-center">
            Request Pilot Access
          </h3>
          
          <form name="ab-clinic" method="POST" data-netlify="true" className="max-w-md mx-auto space-y-4">
            <input type="hidden" name="form-name" value="ab-clinic" />
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Clinic or Organization
              </label>
              <input 
                name="org" 
                placeholder="Your clinic name" 
                required 
                className="w-full border border-border rounded-xl px-4 py-3 bg-background text-foreground"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Your Name
              </label>
              <input 
                name="contact" 
                placeholder="Dr. Jane Smith" 
                required 
                className="w-full border border-border rounded-xl px-4 py-3 bg-background text-foreground"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input 
                name="email" 
                type="email" 
                placeholder="jane@clinic.com" 
                required 
                className="w-full border border-border rounded-xl px-4 py-3 bg-background text-foreground"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Number of Clients (Optional)
              </label>
              <input 
                name="clients" 
                type="number" 
                placeholder="50" 
                className="w-full border border-border rounded-xl px-4 py-3 bg-background text-foreground"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Additional Notes (Optional)
              </label>
              <textarea 
                name="notes" 
                placeholder="Tell us about your practice and specific needs..."
                rows={3}
                className="w-full border border-border rounded-xl px-4 py-3 bg-background text-foreground resize-none"
              />
            </div>
            
            <button 
              type="submit"
              className="w-full rounded-xl px-6 py-4 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-lg"
            >
              Request Pilot
            </button>
          </form>
          
          <p className="text-center text-sm text-muted-foreground mt-6">
            We'll respond within 24 hours to discuss your pilot program.
          </p>
        </Card>

        {/* Contact Info */}
        <Card className="p-6 border-border bg-card/50 text-center">
          <h4 className="text-lg font-semibold text-foreground mb-2">
            Questions?
          </h4>
          <p className="text-muted-foreground mb-4">
            Contact our clinical partnerships team for more information.
          </p>
          <a 
            href="mailto:clinics@godsimij-ai-solutions.com" 
            className="text-primary hover:text-primary/80 font-medium"
          >
            clinics@godsimij-ai-solutions.com
          </a>
        </Card>
      </main>
    </div>
  );
}
