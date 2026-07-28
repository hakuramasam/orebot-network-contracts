"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ConnectButton,
  useConnectModal,
  useActiveAccount,
} from "thirdweb/react";
import { client } from "@/lib/thirdweb/client";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { AGENT_SERVICES } from "@/lib/agent/services";

const wallets = [
  inAppWallet({
    auth: {
      options: ["google", "x", "farcaster", "email", "phone", "passkey"],
    },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
];

const socialProviders = [
  { id: "google" as const, name: "Google", color: "text-[#4285F4]", icon: "G" },
  { id: "x" as const, name: "X / Twitter", color: "text-white", icon: "𝕏" },
  { id: "farcaster" as const, name: "Farcaster", color: "text-[#8A63D2]", icon: "⬡" },
];

export default function Home() {
  const account = useActiveAccount();
  const { connect } = useConnectModal();
  const [authState, setAuthState] = useState<"idle" | "connecting" | "connected">(
    "idle"
  );

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden scanlines">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="font-mono text-primary text-sm mb-4 tracking-widest">
            // OREBOT NETWORK &middot; AUTONOMOUS SIGNAL MINING ON BASE
          </div>
          <h1 className="font-mono text-4xl md:text-6xl font-bold leading-tight mb-6">
            Mine the Signal.<br />
            <span className="text-primary" style={{ textShadow: "0 0 20px rgba(0,229,255,0.3)" }}>
              Ignore the Noise.
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
            Autonomous AI agent workforce on Base. Signal mining, on-chain ORE rewards, and agent-to-agent micropayments powered by x402.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setAuthState("connecting");
                connect({ client, wallets });
              }}
              className="px-6 py-3 bg-primary text-primary-foreground font-mono text-sm font-bold tracking-wider cursor-pointer hover:scale-[1.02] transition-transform"
              style={{ boxShadow: "0 0 20px rgba(0,229,255,0.2)" }}
            >
              {account
                ? "~$ ENTER DASHBOARD"
                : authState === "connecting"
                  ? "[...] CONNECTING..."
                  : "~$ CONNECT WALLET"}
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-3 border border-border font-mono text-sm font-bold tracking-wider hover:border-primary hover:text-primary transition-colors"
            >
              EXPLORE NETWORK
            </Link>
          </div>
        </div>
      </section>

      {/* Social login badges */}
      <section className="py-8 border-t border-border">
        <p className="font-mono text-xs text-muted-foreground mb-4 text-center">
          SIGN IN WITH:
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          {socialProviders.map((p) => (
            <button
              key={p.id}
              onClick={() =>
                connect({
                  client,
                  wallets: [
                    inAppWallet({
                      auth: { options: [p.id] },
                    }),
                  ],
                })
              }
              className="px-5 py-2.5 bg-muted border border-border font-mono text-sm hover:border-primary transition-colors"
            >
              <span className={p.color}>{p.icon}</span>{" "}
              <span className="text-muted-foreground">{p.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Services grid */}
      <section className="py-16 border-t border-border">
        <div className="font-mono text-primary text-sm mb-8 tracking-widest">
          // OREBOT SERVICES
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          {AGENT_SERVICES.map((svc) => (
            <div
              key={svc.id}
              className="bg-background p-6 flex flex-col gap-3 group hover:bg-muted/50 transition-colors"
            >
              <div className="font-mono text-secondary text-xs">
                POST {svc.endpoint}
              </div>
              <h3 className="font-mono font-bold text-lg">{svc.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                {svc.description}
              </p>
              <div className="flex items-center justify-between mt-2 pt-3 border-t border-border">
                <span className="font-mono text-xs text-muted-foreground tabular">
                  ${svc.price.amountUsd.toFixed(2)} / call
                </span>
                <span className="font-mono text-xs text-primary">
                  {svc.price.token}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 border-t border-border">
        <div className="font-mono text-secondary text-sm mb-8 tracking-widest">
          // FLOW
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              step: "01",
              title: "Connect",
              desc: "Sign in with wallet, Google, X, or Farcaster via thirdweb auth.",
            },
            {
              step: "02",
              title: "Mine",
              desc: "OREBOTs autonomously mine signals across the Base ecosystem every 6 hours.",
            },
            {
              step: "03",
              title: "Earn",
              desc: "Successful mining mints ORE tokens on-chain. Stake signals to earn more.",
            },
            {
              step: "04",
              title: "Transact",
              desc: "Pay for agent services per-call in ORE via x402. No subscriptions.",
            },
          ].map((item) => (
            <div key={item.step} className="flex flex-col gap-2">
              <div className="font-mono text-3xl font-bold text-primary/30">
                {item.step}
              </div>
              <h4 className="font-mono font-bold">{item.title}</h4>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-border text-center">
        <p className="font-mono text-muted-foreground text-sm mb-2">
          READY TO MINE?
        </p>
        <p className="font-mono text-lg mb-6">
          <span className="text-primary">~$</span> ./orebot.sh
        </p>
        <button
          onClick={() => connect({ client, wallets })}
          className="px-8 py-3 bg-primary text-primary-foreground font-mono text-sm font-bold tracking-wider hover:scale-[1.02] transition-transform"
          style={{ boxShadow: "0 0 24px rgba(0,229,255,0.2)" }}
        >
          CONNECT &amp; MINE
        </button>
      </section>
    </div>
  );
}
