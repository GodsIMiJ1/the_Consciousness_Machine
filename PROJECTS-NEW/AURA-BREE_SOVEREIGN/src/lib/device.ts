export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'ab-ssr';
  try {
    const keys = ['ab_device_id', 'deviceId'];
    let id = keys.map((k) => {
      try { return localStorage.getItem(k); } catch { return null; }
    }).find(Boolean) as string | null;
    if (!id) {
      const uuid = (globalThis.crypto && 'randomUUID' in globalThis.crypto)
        ? (globalThis.crypto as Crypto).randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      id = `ab-${uuid}`;
      keys.forEach((k) => {
        try { localStorage.setItem(k, id!); } catch {}
      });
    }
    return id;
  } catch (e) {
    // Fallback if localStorage is unavailable
    return `ab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}
