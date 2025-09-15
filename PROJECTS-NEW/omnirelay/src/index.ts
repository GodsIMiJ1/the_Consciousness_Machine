import express from "express";
import { z } from "zod";
import dotenv from "dotenv";
import { supervisor } from "./agents/supervisor.js";
import { flameShield } from "./security/flameshield.js";
import { licenseGate } from "./security/licenseGate.js";

dotenv.config();
const app = express();
app.use(express.json({ limit: "2mb" }));

const InSchema = z.object({
  intent: z.string(),
  payload: z.record(z.any()).optional(),
  meta: z.object({
    userId: z.string().optional(),
    sessionId: z.string().optional(),
    app: z.enum(["ZIONEX", "AURA-BREE", "DASH"]).optional()
  }).optional()
});

app.post("/relay", async (req, res) => {
  try {
    const input = InSchema.parse(req.body);
    const shield = flameShield(input);
    if (!shield.ok) return res.status(400).json({ error: shield.reason });
    const license = licenseGate(input);
    if (!license.ok) return res.status(403).json({ error: license.reason });
    const result = await supervisor.route(input.intent, input.payload ?? {}, input.meta ?? {});
    res.json({ ok: true, result });
  } catch (err: any) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

const port = Number(process.env.PORT || 7070);
app.listen(port, () => {
  console.log("Omnirelay running on port", port);
});