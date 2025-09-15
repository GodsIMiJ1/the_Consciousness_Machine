export type OmnirelayClientOptions = { baseUrl: string; apiKey: string };
export class OmnirelayClient {
  constructor(private opts: OmnirelayClientOptions) {}
  private headers() { return { "content-type": "application/json", "x-api-key": this.opts.apiKey }; }
  async health() { const r = await fetch(this.opts.baseUrl + "/health", { headers: this.headers() }); return r.json(); }
  async invoke(intent: string, payload: any = {}, meta: any = {}) {
    const r = await fetch(this.opts.baseUrl + "/intents:invoke", { method: "POST", headers: this.headers(), body: JSON.stringify({ intent, payload, meta }) });
    if (!r.ok) throw new Error(`invoke failed ${r.status}`);
    return r.json();
  }
  async registerWebhook(url: string, secret = "", events: string[] = ["*"]) {
    const r = await fetch(this.opts.baseUrl + "/webhooks", { method: "POST", headers: this.headers(), body: JSON.stringify({ url, secret, events }) });
    return r.json();
  }
}
