import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Stars, Shuffle, RotateCcw } from "lucide-react";
import { getDeviceId } from "@/lib/device";
import type { ChatMessage } from "@/lib/chatStorage";
import { loadTarot, saveTarot } from "@/lib/tarotStorage";
import { getTarotReading, isOpenAIConfigured } from "@/lib/openai";

// Complete Tarot Deck
const TAROT_DECK = [
  // Major Arcana
  "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
  "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
  "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
  "The Devil", "The Tower", "The Star", "The Moon", "The Sun", "Judgement", "The World",

  // Minor Arcana - Cups
  "Ace of Cups", "Two of Cups", "Three of Cups", "Four of Cups", "Five of Cups",
  "Six of Cups", "Seven of Cups", "Eight of Cups", "Nine of Cups", "Ten of Cups",
  "Page of Cups", "Knight of Cups", "Queen of Cups", "King of Cups",

  // Minor Arcana - Wands
  "Ace of Wands", "Two of Wands", "Three of Wands", "Four of Wands", "Five of Wands",
  "Six of Wands", "Seven of Wands", "Eight of Wands", "Nine of Wands", "Ten of Wands",
  "Page of Wands", "Knight of Wands", "Queen of Wands", "King of Wands",

  // Minor Arcana - Swords
  "Ace of Swords", "Two of Swords", "Three of Swords", "Four of Swords", "Five of Swords",
  "Six of Swords", "Seven of Swords", "Eight of Swords", "Nine of Swords", "Ten of Swords",
  "Page of Swords", "Knight of Swords", "Queen of Swords", "King of Swords",

  // Minor Arcana - Pentacles
  "Ace of Pentacles", "Two of Pentacles", "Three of Pentacles", "Four of Pentacles", "Five of Pentacles",
  "Six of Pentacles", "Seven of Pentacles", "Eight of Pentacles", "Nine of Pentacles", "Ten of Pentacles",
  "Page of Pentacles", "Knight of Pentacles", "Queen of Pentacles", "King of Pentacles"
];

const MAJOR_MEANINGS: Record<string, { upright: string; reversed: string } > = {
  "the fool": { upright: "new beginnings, trust, spontaneity", reversed: "recklessness, hesitancy, fear of the unknown" },
  "the magician": { upright: "manifestation, skill, focused will", reversed: "misdirection, scattered energy, insecurity" },
  "the high priestess": { upright: "intuition, inner voice, mystery", reversed: "secrets, disconnection from intuition" },
  "the empress": { upright: "nurture, abundance, embodiment", reversed: "creative block, overgiving, imbalance" },
  "the emperor": { upright: "structure, leadership, boundaries", reversed: "control, rigidity, power struggle" },
  "the hierophant": { upright: "tradition, guidance, learning", reversed: "rebellion, question authority, redefine beliefs" },
  "the lovers": { upright: "alignment, choice from the heart", reversed: "disharmony, indecision, misalignment" },
  "the chariot": { upright: "willpower, victory, direction", reversed: "scattered will, stalled progress" },
  "strength": { upright: "inner strength, compassion, courage", reversed: "self-doubt, forcefulness, burnout" },
  "the hermit": { upright: "inner guidance, retreat, insight", reversed: "isolation, avoidance, withdrawal" },
  "wheel of fortune": { upright: "cycles, change, turning point", reversed: "resistance to change, delays" },
  "justice": { upright: "truth, fairness, accountability", reversed: "bias, imbalance, avoid responsibility" },
  "the hanged man": { upright: "surrender, new perspective, pause", reversed: "stalling, martyrdom, avoidance" },
  "death": { upright: "transformation, endings lead to rebirth", reversed: "resistance to change, clinging" },
  "temperance": { upright: "balance, moderation, healing", reversed: "excess, fragmentation, impatience" },
  "the devil": { upright: "attachment, shadow, desire", reversed: "release, awareness, reclaim power" },
  "the tower": { upright: "sudden change, revelation, breakdown", reversed: "averted disaster, fear of change" },
  "the star": { upright: "hope, renewal, inner light", reversed: "doubt, disconnection, depletion" },
  "the moon": { upright: "intuition, dreams, uncertainty", reversed: "clarity emerging, dispel confusion" },
  "the sun": { upright: "vitality, clarity, joy", reversed: "temporary clouds, overexposure" },
  "judgement": { upright: "awakening, call, integration", reversed: "self-judgment, hesitation to answer call" },
  "the world": { upright: "completion, wholeness, mastery", reversed: "loose ends, delay in closure" },
};

function normalize(name: string) {
  return name.trim().toLowerCase();
}

function isReversed(text: string) {
  return /reversed|reverse|rx|upside.?down|inverted|\(r\)|rev\.?/i.test(text);
}

// Virtual deck functions
function shuffleDeck(): string[] {
  const deck = [...TAROT_DECK];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function drawThreeCards(): { past: string; present: string; future: string } {
  const shuffled = shuffleDeck();

  // Randomly determine if each card is reversed (about 30% chance each)
  const pastReversed = Math.random() < 0.3;
  const presentReversed = Math.random() < 0.3;
  const futureReversed = Math.random() < 0.3;

  return {
    past: shuffled[0] + (pastReversed ? " (Reversed)" : ""),
    present: shuffled[1] + (presentReversed ? " (Reversed)" : ""),
    future: shuffled[2] + (futureReversed ? " (Reversed)" : "")
  };
}

function minorMeaning(card: string, reversed: boolean): string {
  // very lightweight suit mapping
  const suits: Record<string, string> = {
    cups: "emotions, relationships, intuition",
    swords: "mind, truth, communication",
    wands: "energy, creativity, will",
    pentacles: "material, body, work",
    coins: "material, body, work",
  };
  const ranks: Record<string, string> = {
    ace: "seed, pure potential",
    two: "duality, choice",
    three: "growth, collaboration",
    four: "stability, consolidation",
    five: "challenge, change",
    six: "harmony, generosity",
    seven: "assessment, faith",
    eight: "movement, skill",
    nine: "fruition, resilience",
    ten: "completion, legacy",
    page: "curiosity, learner",
    knight: "action, pursuit",
    queen: "embodiment, nurture",
    king: "mastery, leadership",
  };

  const lower = normalize(card);
  const suit = Object.keys(suits).find(s => lower.includes(s));
  const rank = Object.keys(ranks).find(r => lower.startsWith(r));
  const base = `${rank ? ranks[rank] + ' of ' : ''}${suit ? suits[suit] : 'theme'}`;
  return reversed ? `shadow of ${base}` : base;
}

function meaningFor(card: string): { phrase: string } {
  const n = normalize(card);
  const rev = isReversed(card);
  const major = MAJOR_MEANINGS[n];
  if (major) {
    return { phrase: rev ? major.reversed : major.upright };
  }
  return { phrase: minorMeaning(card, rev) };
}

function parseTriple(message: string): { past?: string; present?: string; future?: string } {
  const text = message.trim();

  // Try multiple parsing patterns

  // Pattern 1: "Past: X, Present: Y, Future: Z"
  const explicitRegex = /past\s*:\s*([^,\n]+?)[\s,]*present\s*:\s*([^,\n]+?)[\s,]*future\s*:\s*([^\n,]+)/i;
  let m = text.match(explicitRegex);
  if (m) {
    return { past: m[1].trim(), present: m[2].trim(), future: m[3].trim() };
  }

  // Pattern 2: "X, Y, Z" (three cards separated by commas)
  const parts = text.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
  if (parts.length >= 3) {
    return { past: parts[0], present: parts[1], future: parts[2] };
  }

  // Pattern 3: Line by line
  const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
  if (lines.length >= 3) {
    return { past: lines[0], present: lines[1], future: lines[2] };
  }

  // Pattern 4: Try to extract card names with orientation from any format
  // Look for card names that might include reversed indicators
  const cardPattern = /(?:the\s+)?([a-z\s]+?)(?:\s*(?:reversed|reverse|rx|upside.?down|inverted|\(r\)|rev\.?))?/gi;
  const matches = text.match(cardPattern);
  if (matches && matches.length >= 3) {
    return {
      past: matches[0].trim(),
      present: matches[1].trim(),
      future: matches[2].trim()
    };
  }

  return {};
}

function buildReading(past: string, present: string, future: string, question?: string): string {
  const mp = meaningFor(past).phrase;
  const mpr = meaningFor(present).phrase;
  const mf = meaningFor(future).phrase;

  const intro = question
    ? `Regarding "${question}", here is your three-card reading:`
    : `Here is your three-card reading:`;

  const synthesis = `Overall, your spread suggests a movement from ${mp} in the past, through ${mpr} now, toward ${mf} ahead. The thread here is to honor what has been learned, act with mindful intention in the present, and make space for the outcome to unfold.`;

  const gentle = `Take a slow breath. Notice what resonates and what you feel drawn to explore. Tarot reflects — you choose.`;

  return [
    intro,
    `Past — ${past}: ${mp}.`,
    `Present — ${present}: ${mpr}.`,
    `Future — ${future}: ${mf}.`,
    synthesis,
    gentle,
  ].join("\n\n");
}

export default function Tarot() {
  const [deviceId] = useState(() => getDeviceId());
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 't-hello',
    role: 'assistant',
    content: `🔮 **Welcome to AURA-MYSTIC Tarot Reader** ✨

I'm here to provide you with insightful 3-card readings. You can:

🃏 **Use Virtual Deck:** Click "Draw 3 Cards" to let me draw for you
📝 **Enter Your Own:** Share your cards in any format:
   • Simple: The Hermit, The Star, The Sun
   • Labeled: Past: The Hermit, Present: The Star, Future: The Sun
   • With orientation: The Hermit (Reversed), The Star, The Sun

You can also include a question for more focused guidance. Ready for your reading? 🌟`,
    timestamp: Date.now()
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [drawnCards, setDrawnCards] = useState<{ past: string; present: string; future: string } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // SEO
  useEffect(() => {
    document.title = "AI Tarot Reader | AURA-BREE";
    const desc = document.querySelector('meta[name="description"]');
    if (!desc) {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = 'AI Tarot Reader: Share your Past, Present, Future cards and receive a thoughtful reading.';
      document.head.appendChild(m);
    } else {
      desc.setAttribute('content', 'AI Tarot Reader: Share your Past, Present, Future cards and receive a thoughtful reading.');
    }
  }, []);

  useEffect(() => {
    const stored = loadTarot(deviceId);
    if (stored && stored.length) setMessages(stored);
    else saveTarot(deviceId, messages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
    saveTarot(deviceId, messages);
  }, [messages, deviceId]);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;

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
    setIsLoading(true);

    try {
      const triple = parseTriple(text);
      if (!(triple.past && triple.present && triple.future)) {
        const helpMessage = `I need three cards for your reading. You can format them in any of these ways:

📝 **Option 1:** Past: The Hermit, Present: The Star, Future: The Sun

📝 **Option 2:** The Hermit, The Star, The Sun

📝 **Option 3:**
The Hermit
The Star
The Sun

Just share your three cards and I'll provide your reading! ✨`;

        const bot: ChatMessage = {
          id: `${Date.now()}-a`,
          role: 'assistant',
          content: helpMessage,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, bot]);
        setIsLoading(false);
        return;
      }

      const reply = await getTarotReading({
        past: triple.past,
        present: triple.present,
        future: triple.future
      });
      const bot: ChatMessage = { id: `${Date.now()}-a`, role: 'assistant', content: reply, timestamp: Date.now() };
      setMessages(prev => [...prev, bot]);
    } catch (err: any) {
      console.error('AI tarot error:', err);
      const bot: ChatMessage = {
        id: `${Date.now()}-a`,
        role: 'assistant',
        content: err.message || 'I had trouble connecting to the AI for a reading. Please try again.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, bot]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrawCards = () => {
    const cards = drawThreeCards();
    setDrawnCards(cards);

    const cardMessage = `🃏 **Virtual Deck Draw** ✨

Your three cards have been drawn:

🔮 **Past:** ${cards.past}
🔮 **Present:** ${cards.present}
🔮 **Future:** ${cards.future}

Would you like me to interpret this spread? You can also add a specific question for more focused guidance.`;

    const bot: ChatMessage = {
      id: `${Date.now()}-draw`,
      role: 'assistant',
      content: cardMessage,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, bot]);
  };

  const handleUseDrawnCards = () => {
    if (!drawnCards) return;

    const cardText = `Past: ${drawnCards.past}, Present: ${drawnCards.present}, Future: ${drawnCards.future}`;
    setInput(cardText);
  };

  const handleGetReading = async () => {
    if (!drawnCards) return;

    const cardText = `Past: ${drawnCards.past}, Present: ${drawnCards.present}, Future: ${drawnCards.future}`;
    await send(cardText);
    setDrawnCards(null); // Clear drawn cards after reading
  };

  return (
    <div className="bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-0">
        <div className="max-w-screen-sm mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Stars className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">AI Tarot Reader</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Share your three cards: Past, Present, Future.</p>
        </div>
      </header>

      <main className="max-w-screen-sm mx-auto px-4 py-6 relative z-10">
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <div className="h-[calc(100vh-280px)] min-h-[500px] flex flex-col">
            {/* messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-lg border ${m.role === 'user' ? 'bg-gradient-flame text-white border-primary/20' : 'bg-card border-border'}`}>
                    {m.content.split('\n').map((line, i) => (
                      <p key={i} className="text-sm leading-relaxed whitespace-pre-wrap">{line}</p>
                    ))}
                  </div>
                </div>
              ))}
              {isLoading && (
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

            {/* Virtual Deck Controls */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex gap-2 mb-3">
                <Button
                  onClick={handleDrawCards}
                  disabled={isLoading}
                  variant="secondary"
                  className="flex-1 bg-primary/10 text-primary hover:bg-primary/20"
                >
                  <Shuffle className="w-4 h-4 mr-2" /> Draw 3 Cards
                </Button>
                {drawnCards && (
                  <Button
                    onClick={handleGetReading}
                    disabled={isLoading}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    <Stars className="w-4 h-4 mr-2" /> Get Reading
                  </Button>
                )}
              </div>

              {/* Manual Input */}
              <div className="space-y-3">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  placeholder="Or enter your own cards... (e.g., The Hermit (Reversed), The Star, The Sun)"
                  className="h-20 resize-none overflow-y-auto"
                />
                <div className="flex justify-between">
                  {drawnCards && (
                    <Button
                      onClick={handleUseDrawnCards}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" /> Use Drawn Cards
                    </Button>
                  )}
                  <Button
                    onClick={() => send(input)}
                    disabled={!input.trim() || isLoading}
                    className="bg-primary hover:bg-primary/90 ml-auto"
                  >
                    <Send className="w-4 h-4 mr-2" /> Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
