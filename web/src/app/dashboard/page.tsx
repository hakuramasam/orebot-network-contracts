"use client";

import { useState, useRef, useEffect } from "react";
import {
  useActiveAccount,
  ConnectButton,
  useConnectModal,
} from "thirdweb/react";
import { client } from "@/lib/thirdweb/client";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { AGENT_SERVICES } from "@/lib/agent/services";

const wallets = [
  inAppWallet({
    auth: { options: ["google", "x", "farcaster", "email", "phone", "passkey"] },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
];

type Message = { role: "user" | "agent" | "system"; content: string };

export default function Dashboard() {
  const account = useActiveAccount();
  const { connect } = useConnectModal();
  const [selectedService, setSelectedService] = useState(AGENT_SERVICES[0].id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const service = AGENT_SERVICES.find((s) => s.id === selectedService)!;

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch(service.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      if (resp.status === 402) {
        const paymentInfo = await resp.json();
        setMessages((m) => [
          ...m,
          {
            role: "system",
            content: `[Payment Required] This call costs $${service.price.amountUsd.toFixed(2)} in ${service.price.token}. To use this service, send a payment header with your request. See x402 docs for details.`,
          },
        ]);
      } else if (resp.ok) {
        const data = await resp.json();
        setMessages((m) => [
          ...m,
          { role: "agent", content: data.result || data.message || JSON.stringify(data) },
        ]);
      } else {
        const errorText = await resp.text();
        setMessages((m) => [
          ...m,
          { role: "system", content: `Error: ${resp.status} - ${errorText}` },
        ]);
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "system", content: `Connection error: ${(err as Error).message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <div className="font-mono text-primary text-sm mb-4 tracking-widest">
          // AUTH REQUIRED
        </div>
        <h1 className="font-mono text-3xl font-bold mb-4">Dashboard</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Connect your wallet or sign in with a social account to access the OREBOT Network Hub.
        </p>
        <button
          onClick={() => connect({ client, wallets })}
          className="px-6 py-3 bg-primary text-primary-foreground font-mono text-sm font-bold tracking-wider hover:scale-[1.02] transition-transform"
          style={{ boxShadow: "0 0 20px rgba(0,229,255,0.2)" }}
        >
          ~$ CONNECT WALLET
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div>
          <div className="font-mono text-primary text-xs tracking-widest mb-1">
            // AGENT DASHBOARD
          </div>
          <h1 className="font-mono text-lg font-bold">
            {service.name} <span className="text-muted-foreground font-normal text-sm">v0.1.0</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-muted-foreground">
            {account.address.slice(0, 6)}...{account.address.slice(-4)}
          </div>
          <ConnectButton client={client} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Service sidebar */}
        <aside className="space-y-2">
          {AGENT_SERVICES.map((svc) => (
            <button
              key={svc.id}
              onClick={() => {
                setSelectedService(svc.id);
                setMessages([]);
              }}
              className={`w-full text-left p-3 border font-mono text-xs transition-colors ${
                selectedService === svc.id
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-primary/30 text-muted-foreground"
              }`}
            >
              <div className="font-bold">{svc.name}</div>
              <div className="mt-1 opacity-60">${svc.price.amountUsd.toFixed(2)}/call</div>
            </button>
          ))}
        </aside>

        {/* Chat area */}
        <div className="md:col-span-3 border border-border flex flex-col" style={{ minHeight: "60vh" }}>
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {messages.length === 0 && (
              <div className="text-center py-12 text-muted-foreground font-mono text-sm">
                <p className="text-primary/50 mb-2">&gt; {service.endpoint}</p>
                <p>{service.description}</p>
                <p className="text-xs mt-4 opacity-50">
                  Type a prompt and press Enter to start.
                  <br />Each call costs ${service.price.amountUsd.toFixed(2)} in {service.price.token}.
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`font-mono text-sm p-3 ${
                  msg.role === "user"
                    ? "bg-muted ml-8"
                    : msg.role === "agent"
                      ? "bg-primary/5 border-l-2 border-primary mr-8"
                      : "bg-yellow-500/5 border-l-2 border-accent mr-8 text-xs"
                }`}
              >
                <div className="text-[10px] text-muted-foreground mb-1">
                  {msg.role === "user" ? "YOU" : msg.role === "agent" ? "AGENT" : "SYS"}
                </div>
                <pre className="whitespace-pre-wrap font-mono text-sm">{msg.content}</pre>
              </div>
            ))}
            {loading && (
              <div className="font-mono text-sm text-primary ml-8">
                <span className="cursor-blink">█</span> Processing...
              </div>
            )}
          </div>

          <div className="border-t border-border p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Query the OREBOT signal database..."
              className="flex-1 bg-muted border border-border px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="px-4 py-2 bg-primary text-primary-foreground font-mono text-sm font-bold hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              SEND
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
