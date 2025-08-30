// Legacy OpenAI-only implementation - will be replaced by FlameRouter
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Required for client-side usage
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface TarotReading {
  past: string;
  present: string;
  future: string;
}

export interface HoroscopeRequest {
  mode: 'horoscope' | 'dream';
  sign?: string;
  date?: string;
  dream?: string;
}

// Chat service for AURA-BREE therapeutic companion
export async function getChatResponse(messages: ChatMessage[]): Promise<string> {
  try {
    const systemPrompt = `You are AURA-BREE, a compassionate, trauma-informed therapeutic companion.
- Be concise (2-5 sentences), warm, and validating.
- Ask gentle, open-ended questions.
- Offer one small, actionable suggestion when appropriate.
- Avoid diagnosis or medical claims. Provide crisis resources if user expresses intent to harm.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.8,
      max_tokens: 500
    });

    return response.choices[0]?.message?.content || 'I apologize, but I could not generate a response at this time.';
  } catch (error) {
    console.error('OpenAI Chat Error:', error);
    throw new Error('Failed to get chat response. Please check your API key and try again.');
  }
}

// Tarot reading service
export async function getTarotReading(reading: TarotReading): Promise<string> {
  try {
    const systemPrompt = `You are AURA-MYSTIC, a wise tarot reader offering gentle guidance.
- Interpret the 3-card spread (Past, Present, Future) with compassion.
- Focus on empowerment and personal growth.
- Avoid deterministic predictions.
- Keep responses 5-7 sentences.
- Warm tone, practical insight.
- No medical or legal advice.`;

    const userPrompt = `Please interpret this 3-card tarot spread:
Past: ${reading.past}
Present: ${reading.present}
Future: ${reading.future}

Provide a thoughtful interpretation that connects these cards in a meaningful way.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 400
    });

    return response.choices[0]?.message?.content || 'I could not interpret the cards at this time.';
  } catch (error) {
    console.error('OpenAI Tarot Error:', error);
    throw new Error('Failed to get tarot reading. Please check your API key and try again.');
  }
}

// Horoscope and dream interpretation service
export async function getHoroscopeOrDream(request: HoroscopeRequest): Promise<string> {
  try {
    if (request.mode === 'horoscope') {
      const systemPrompt = `You are AURA-ORACLE, a mystical astrologer offering daily guidance.
- Provide uplifting, empowering horoscopes.
- Focus on personal growth and positive possibilities.
- Keep it 4-6 sentences.
- Warm, encouraging tone.
- No deterministic claims.`;

      const userPrompt = `Create a daily horoscope for ${request.sign} on ${request.date || 'today'}. Focus on emotional wellness, personal growth, and gentle guidance.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 300
      });

      return response.choices[0]?.message?.content || 'Your horoscope could not be generated at this time.';
    } else {
      // Dream interpretation
      const systemPrompt = `You are AURA-ORACLE, an insightful dream interpreter.
Guidelines:
- Explore symbolic patterns (Jungian/archetypal) with grounded care.
- Never give medical, legal, or deterministic claims.
- Keep it 6-9 sentences, ending with 1 reflective question.
- Invite agency and gentle next steps.`;

      const signHint = request.sign ? ` for someone with the ${request.sign} archetype` : '';
      const userPrompt = `Interpret this dream in a supportive, symbolic way${signHint}:
"""
${request.dream}
"""`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 400
      });

      return response.choices[0]?.message?.content || 'I could not interpret your dream at this time.';
    }
  } catch (error) {
    console.error('OpenAI Horoscope/Dream Error:', error);
    throw new Error('Failed to get response. Please check your API key and try again.');
  }
}

// Check if OpenAI is properly configured
export function isOpenAIConfigured(): boolean {
  return !!import.meta.env.VITE_OPENAI_API_KEY;
}
