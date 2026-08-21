import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Link from "next/link";

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OrebotProtocol - Autonomous Signal Mining on Base",
  description:
    "Autonomous AI agent workforce mining signals and minting ORE on Base. Powered by x402 micropayments.",
  keywords: ["AI", "web3", "thirdweb", "x402", "payments", "agent"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${jetbrains.variable} ${inter.variable} min-h-dvh bg-background text-foreground antialiased`}
      >
        <Providers>
          <div className="min-h-dvh flex flex-col">
            <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
              <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                  <span className="text-primary font-mono text-lg" style={{textShadow: "0 0 10px rgba(0,229,255,0.4)"}}>
                    &gt;_
                  </span>
                  <span className="font-mono font-bold tracking-tight">
                    Orebot<span className="text-primary">Protocol</span>
                  </span>
                </Link>
                <div className="flex items-center gap-4 text-sm font-mono">
                  <Link
                    href="/dashboard"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    ~/dashboard
                  </Link>
                  <a
                    href="/api/agent"
                    className="text-muted-foreground hover:text-secondary transition-colors"
                  >
                    /api
                  </a>
                </div>
              </nav>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t border-border py-6 text-center text-xs font-mono text-muted-foreground">
              <p>
                OrebotProtocol &middot; Powered by{" "}
                <span className="text-primary">thirdweb</span> x402 &middot;
                On-chain micropayments
              </p>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
