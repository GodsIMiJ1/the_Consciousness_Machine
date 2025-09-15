import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GMIJ Staking Dashboard",
  description: "Stake GMIJ, claim rewards, and view live vault stats."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
