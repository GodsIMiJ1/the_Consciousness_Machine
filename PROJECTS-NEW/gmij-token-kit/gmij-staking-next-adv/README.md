# GMIJ Staking Dashboard Advanced

Adds:
- APR estimator and daily rewards
- Read only status API at `/api/status`
- Network switcher for Polygon, Base, Base Sepolia
- Transaction toasts and error parsing
- Optional allowlist gate and hCaptcha verification

## Quick start
```bash
npm i
cp .env.example .env
npm run dev
```

## Configure
- Set default envs for Polygon in `.env`
- Optionally set NEXT_PUBLIC_ALLOWLIST with comma separated addresses
- Optionally set HCAPTCHA_SITEKEY and HCAPTCHA_SECRET to enable captcha verification route

## Deploy
Vercel or Netlify. Expose the same env vars.

## Status API
GET `/api/status` returns JSON with vault totals, reward rate, APR estimate, and daily rewards.
