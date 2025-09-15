import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";

export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const provided = req.header("x-api-key") || "";
  const keys = (process.env.API_KEYS || "").split(",").map(s => s.trim()).filter(Boolean);
  if (!keys.length) return res.status(500).json({ ok: false, error: "server not configured with API_KEYS" });
  const ok = keys.some(k => safeEq(k, provided));
  if (!ok) return res.status(401).json({ ok: false, error: "unauthorized" });
  next();
}

function safeEq(a: string, b: string) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}
