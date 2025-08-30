import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Moon, RefreshCcw } from "lucide-react";
import { getHoroscopeOrDream, isOpenAIConfigured } from "@/lib/openai";
import { getDeviceId } from "@/lib/device";
import type { ChatMessage } from "@/lib/chatStorage";

const SIGNS = [
  "Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
];
const SIGN_GLYPHS: Record<string, string> = {
  aries: "\u2648", taurus: "\u2649", gemini: "\u264A", cancer: "\u264B", leo: "\u264C", virgo: "\u264D",
  libra: "\u264E", scorpio: "\u264F", sagittarius: "\u2650", capricorn: "\u2651", aquarius: "\u2652", pisces: "\u2653"
};

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function Horoscope() {
  const [deviceId] = useState(() => getDeviceId());
  const [sign, setSign] = useState<string>(() => localStorage.getItem('ab_zodiac_sign') || 'Aries');
  const [horoscope, setHoroscope] = useState<string>("");
  const [loadingHoroscope, setLoadingHoroscope] = useState(false);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'oracle-welcome',
    role: 'assistant',
    content: "I am AURA-ORACLE. Share a dream, image, or fragment you'd like me to interpret.",
    timestamp: Date.now()
  }]);
  const endRef = useRef<HTMLDivElement>(null);

  const dateKey = useMemo(() => todayISO(), []);
  const horoscopeKey = useMemo(() => `ab:horoscope:${deviceId}:${dateKey}:${sign.toLowerCase()}`, [deviceId, dateKey, sign]);
  const chatKey = useMemo(() => `ab:${deviceId}:oracle_messages`, [deviceId]);

  // SEO
  useEffect(() => {
    const title = "AI Horoscope & Dream Oracle | AURA-BREE";
    document.title = title;
    // meta description
    const descContent = "Daily AI horoscope with a mystical Dream Oracle chat. Get fresh guidance every morning and supportive dream interpretations.";
    let desc = document.querySelector('meta[name="description"]');
    if (!desc) {
      desc = document.createElement('meta');
      desc.setAttribute('name', 'description');
      document.head.appendChild(desc);
    }
    desc.setAttribute('content', descContent);

    // canonical
    const href = `${location.origin}/horoscope`;
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', href);

    // JSON-LD
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description: descContent,
      url: href,
    };
    let script = document.getElementById('ld-horoscope') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script') as HTMLScriptElement;
      script.id = 'ld-horoscope';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(ld);
  }, []);

  // Load cached chat and horoscope
  useEffect(() => {
    // chat
    try {
      const raw = localStorage.getItem(chatKey);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length) setMessages(parsed);
      }
    } catch {}

    // horoscope
    fetchHoroscope(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [horoscopeKey]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
    try {
      localStorage.setItem('ab_zodiac_sign', sign);
      localStorage.setItem(chatKey, JSON.stringify(messages));
    } catch {}
  }, [messages, sign, chatKey]);

  const fetchHoroscope = async (force = false) => {
    if (!force) {
      try {
        const cached = localStorage.getItem(horoscopeKey);
        if (cached) {
          setHoroscope(cached);
          return;
        }
      } catch {}
    }

    if (!isOpenAIConfigured()) {
      setHoroscope('OpenAI API key is not configured. Please add your VITE_OPENAI_API_KEY to the .env file.');
      return;
    }

    setLoadingHoroscope(true);
    try {
      const text = await getHoroscopeOrDream({
        mode: 'horoscope',
        sign: sign.toLowerCase(),
        date: dateKey
      });
      setHoroscope(text);
      try { localStorage.setItem(horoscopeKey, text); } catch {}
    } catch (e: any) {
      console.error('Horoscope fetch error:', e);
      setHoroscope(e.message || 'I had trouble retrieving your horoscope. Please try again.');
    } finally {
      setLoadingHoroscope(false);
    }
  };

  const send = async (text: string) => {
    if (!text.trim() || chatLoading) return;

    if (!isOpenAIConfigured()) {
      const errorMsg: ChatMessage = {
        id: `${Date.now()}-a`,
        role: 'assistant',
        content: 'OpenAI API key is not configured. Please add your VITE_OPENAI_API_KEY to the .env file.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    const user: ChatMessage = { id: `${Date.now()}-u`, role: 'user', content: text.trim(), timestamp: Date.now() };
    setMessages(prev => [...prev, user]);
    setInput("");
    setChatLoading(true);

    try {
      const reply = await getHoroscopeOrDream({
        mode: 'dream',
        dream: text.trim(),
        sign: sign.toLowerCase()
      });
      const bot: ChatMessage = { id: `${Date.now()}-a`, role: 'assistant', content: reply, timestamp: Date.now() };
      setMessages(prev => [...prev, bot]);
    } catch (err: any) {
      console.error('Oracle error:', err);
      const bot: ChatMessage = {
        id: `${Date.now()}-a`,
        role: 'assistant',
        content: err.message || 'I had trouble connecting to the Oracle. Please try again.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, bot]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="starfield">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-0">
        <div className="max-w-screen-sm mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-primary/30 bg-primary/10 text-primary grid place-items-center font-cormorant text-xl">
              {SIGN_GLYPHS[sign.toLowerCase()]}
            </div>
            <div>
              <h1 className="text-lg font-cormorant font-semibold text-foreground">Daily Horoscope & Dream Oracle</h1>
              <p className="text-xs text-muted-foreground">Fresh horoscope each morning, with mystical chat</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-sm mx-auto px-4 py-6 space-y-6 relative z-10">
        {/* Horoscope Card */}
        <Card className="p-4 border-border bg-card/50 backdrop-blur-sm animate-fade-in">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-primary/30 bg-primary/10 text-primary grid place-items-center font-cormorant text-xl">
                {SIGN_GLYPHS[sign.toLowerCase()]}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Your sign</span>
                <Select value={sign} onValueChange={(v) => setSign(v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select sign" />
                  </SelectTrigger>
                  <SelectContent>
                    {SIGNS.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                <span>For {dateKey}</span>
                <Button variant="outline" size="sm" onClick={() => fetchHoroscope(true)} disabled={loadingHoroscope}>
                  <RefreshCcw className="w-3 h-3 mr-1" /> Refresh
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border p-4 bg-background/60 shadow-glow animate-flame-glow">
              {loadingHoroscope ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  Generating your horoscope...
                </div>
              ) : (
                <div className="prose prose-invert max-w-none text-lg font-cormorant leading-relaxed whitespace-pre-wrap">{horoscope}</div>
              )}
            </div>
          </div>
          <div className="h-[calc(100vh-400px)] min-h-[400px] flex flex-col">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-cormorant font-semibold text-foreground">AURA-ORACLE Dream Interpreter</h2>
              <p className="text-sm text-muted-foreground">Share a dream; I’ll explore symbols and offer grounded insight.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-lg border shadow-glow ${m.role === 'user' ? 'bg-gradient-flame text-white border-primary/20' : 'bg-card border-border'}`}>
                    {m.content.split('\n').map((line, i) => (
                      <p key={i} className="text-sm leading-relaxed whitespace-pre-wrap">{line}</p>
                    ))}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-4 rounded-lg border bg-card border-border">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="p-4 border-t border-border space-y-3 bg-card">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder={"Describe your dream… (Enter to send, Shift+Enter for a new line)"}
                className="h-24 resize-none overflow-y-auto"
              />
              <div className="flex justify-end">
                <Button onClick={() => send(input)} disabled={!input.trim() || chatLoading} className="bg-primary hover:bg-primary/90 shadow-glow">
                  <Send className="w-4 h-4 mr-2" /> Send
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
