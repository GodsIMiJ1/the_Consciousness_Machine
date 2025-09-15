import type { ChatMessage } from "@/lib/chatStorage";

const keyFor = (deviceId: string) => `ab:${deviceId}:tarot`;

export function loadTarot(deviceId: string): ChatMessage[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(keyFor(deviceId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveTarot(deviceId: string, messages: ChatMessage[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(keyFor(deviceId), JSON.stringify(messages));
  } catch {
    // ignore
  }
}
