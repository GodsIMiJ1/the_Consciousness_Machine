import { Router } from "express";
import { supervisor } from "../agents/supervisor.js";
import { apiKeyAuth } from "./auth.js";
import { registerWebhook, listWebhooks, removeWebhook, emitEvent } from "./webhooks.js";

export const apiRouter = Router();
apiRouter.use(apiKeyAuth);

apiRouter.get("/health", (_req, res) => res.json({ ok: true, v: 1 }));

apiRouter.post("/intents:invoke", async (req, res) => {
  const { intent, payload = {}, meta = {} } = req.body || {};
  if (!intent) return res.status(400).json({ ok: false, error: "missing intent" });
  try {
    const result = await supervisor.route(String(intent), payload, meta);
    res.json({ ok: true, result });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

apiRouter.get("/webhooks", (_req, res) => res.json({ ok: true, items: listWebhooks() }));
apiRouter.post("/webhooks", (req, res) => {
  const { url, secret, events } = req.body || {};
  if (!url) return res.status(400).json({ ok: false, error: "missing url" });
  const id = registerWebhook({ url, secret: secret || "", events: Array.isArray(events) ? events : ["*"] });
  res.json({ ok: true, id });
});
apiRouter.delete("/webhooks/:id", (req, res) => {
  const ok = removeWebhook(req.params.id);
  res.json({ ok });
});

apiRouter.post("/events:emit", async (req, res) => {
  const { type, data } = req.body || {};
  if (!type) return res.status(400).json({ ok: false, error: "missing type" });
  const delivered = await emitEvent({ type, data: data ?? {} });
  res.json({ ok: true, delivered });
});
