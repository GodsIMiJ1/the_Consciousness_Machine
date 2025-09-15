import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

type Hook = { id: string; url: string; secret: string; events: string[] };
const STORE = path.resolve(process.cwd(), "data/webhooks.json");

function load(): Hook[] {
  try {
    return JSON.parse(fs.readFileSync(STORE, "utf-8"));
  } catch {
    return [];
  }
}
function save(list: Hook[]) {
  fs.mkdirSync(path.dirname(STORE), { recursive: true });
  fs.writeFileSync(STORE, JSON.stringify(list, null, 2));
}

export function listWebhooks(): Hook[] { return load(); }

export function registerWebhook(h: { url: string; secret: string; events: string[] }): string {
  const list = load();
  const id = crypto.randomUUID();
  list.push({ id, ...h });
  save(list);
  return id;
}

export function removeWebhook(id: string): boolean {
  const list = load();
  const next = list.filter(h => h.id !== id);
  save(next);
  return next.length !== list.length;
}

export async function emitEvent(evt: { type: string; data: any }) {
  const hooks = load();
  const payload = JSON.stringify({ type: evt.type, data: evt.data, ts: Date.now() });
  const deliveries = await Promise.all(hooks
    .filter(h => h.events.includes("*") || h.events.includes(evt.type))
    .map(async h => {
      const sig = sign(h.secret, payload);
      try {
        const res = await fetch(h.url, { method: "POST", headers: { "content-type": "application/json", "x-omnirelay-signature": sig }, body: payload });
        return { id: h.id, status: res.status };
      } catch (e) {
        return { id: h.id, status: 0 };
      }
    }));
  return deliveries;
}

function sign(secret: string, body: string) {
  return crypto.createHmac("sha256", secret || "none").update(body).digest("hex");
}
