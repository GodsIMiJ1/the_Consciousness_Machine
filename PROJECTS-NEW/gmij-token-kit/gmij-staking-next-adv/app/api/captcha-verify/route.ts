import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    const secret = process.env.HCAPTCHA_SECRET as string;
    if (!secret) return NextResponse.json({ ok: false, error: "missing-secret" }, { status: 400 });
    const res = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }).toString()
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "captcha-failed" }, { status: 500 });
  }
}
