export type CheckIn = {
  id: string;
  score: number; // 1-10
  note?: string;
  timestamp: number; // ms since epoch
};

const keyFor = (deviceId: string) => `ab:${deviceId}:checkins`;

export function loadCheckIns(deviceId: string): CheckIn[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(keyFor(deviceId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CheckIn[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCheckIns(deviceId: string, items: CheckIn[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(keyFor(deviceId), JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function addCheckIn(deviceId: string, score: number, note?: string): CheckIn[] {
  const items = loadCheckIns(deviceId);
  const item: CheckIn = {
    id: `${Date.now()}`,
    score,
    note,
    timestamp: Date.now(),
  };
  const next = [...items, item].sort((a, b) => a.timestamp - b.timestamp);
  saveCheckIns(deviceId, next);
  return next;
}

export function latestCheckIn(deviceId: string): CheckIn | null {
  const items = loadCheckIns(deviceId);
  if (!items.length) return null;
  return items[items.length - 1];
}

export function computeStreak(deviceId: string): number {
  const items = loadCheckIns(deviceId);
  if (!items.length) return 0;
  const dayKey = (ts: number) => new Date(new Date(ts).getFullYear(), new Date(ts).getMonth(), new Date(ts).getDate()).toISOString().slice(0, 10);
  const days = new Set(items.map(i => dayKey(i.timestamp)));
  let streak = 0;
  const today = new Date();
  // Count consecutive days from today backwards
  for (let i = 0; ; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (days.has(key)) streak++;
    else break;
  }
  return streak;
}
