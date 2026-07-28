"use client";

import { useState, useEffect } from "react";
import {
  ConnectButton,
  useActiveAccount,
} from "thirdweb/react";
import { client } from "@/lib/thirdweb/client";
import { CONTRACT_ADDRESSES, CLASS_NAMES, CLASS_EMOJI } from "@/lib/orebot/registry";

type Orebot = {
  id: number;
  callsign: string;
  wallet: string;
  class: number;
  className: string;
  classEmoji: string;
  reputation: number;
  signalsMined: number;
  tasksCompleted: number;
  creditsEarned: number;
  activated: boolean;
};

type NetworkStats = {
  total_orebots: number;
  active_orebots: number;
  total_signals_mined: number;
  total_tasks_completed: number;
  total_ore_minted: number;
  ore_supply: number;
  trend_supply: number;
};

export default function NetworkPage() {
  const account = useActiveAccount();
  const [roster, setRoster] = useState<Orebot[]>([]);
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/orebot/stats");
        const data = await res.json();
        if (data.ok) {
          setRoster(data.roster);
          setStats(data.stats);
        } else {
          setError(data.error || "Failed to load network data");
        }
      } catch (err) {
        setError("Network request failed");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
    // Refresh every 60s
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="font-mono text-primary text-sm mb-1 tracking-widest">
            // OREBOT NETWORK
          </div>
          <h1 className="font-mono text-2xl font-bold">Network Status</h1>
        </div>
        <ConnectButton client={client} />
      </div>

      {loading && (
        <div className="font-mono text-muted-foreground text-center py-12">
          [Scanning on-chain data...]
        </div>
      )}

      {error && (
        <div className="font-mono text-red-500 text-center py-12">
          Error: {error}
        </div>
      )}

      {/* Stats Grid */}
      {stats && !loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border mb-8">
          {[
            { label: "Active OREBOTs", value: `${stats.active_orebots}/${stats.total_orebots}`, accent: "text-primary" },
            { label: "Signals Mined", value: stats.total_signals_mined.toString(), accent: "text-primary" },
            { label: "ORE Minted", value: stats.total_ore_minted.toString(), accent: "text-primary" },
            { label: "Tasks Done", value: stats.total_tasks_completed.toString(), accent: "text-primary" },
          ].map((stat) => (
            <div key={stat.label} className="bg-background p-4 flex flex-col gap-1">
              <div className="font-mono text-xs text-muted-foreground">{stat.label}</div>
              <div className={`font-mono text-xl font-bold ${stat.accent}`}>{stat.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Token Supply */}
      {stats && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border mb-8">
          <div className="bg-background p-4">
            <div className="font-mono text-xs text-muted-foreground mb-1">$ORE Supply</div>
            <div className="font-mono text-lg font-bold">{stats.ore_supply.toLocaleString()}</div>
            <div className="font-mono text-xs text-muted-foreground mt-1 truncate">
              {CONTRACT_ADDRESSES.ORE_TOKEN}
            </div>
          </div>
          <div className="bg-background p-4">
            <div className="font-mono text-xs text-muted-foreground mb-1">$TREND Supply</div>
            <div className="font-mono text-lg font-bold">{stats.trend_supply.toLocaleString()}</div>
            <div className="font-mono text-xs text-muted-foreground mt-1 truncate">
              {CONTRACT_ADDRESSES.TREND_TOKEN}
            </div>
          </div>
        </div>
      )}

      {/* Roster Table */}
      {roster.length > 0 && !loading && (
        <div>
          <div className="font-mono text-primary text-sm mb-4 tracking-widest">
            // OREBOT ROSTER
          </div>
          <div className="border border-border">
            <table className="w-full font-mono text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left p-3 font-normal">Callsign</th>
                  <th className="text-left p-3 font-normal hidden md:table-cell">Class</th>
                  <th className="text-right p-3 font-normal">Signals</th>
                  <th className="text-right p-3 font-normal hidden md:table-cell">Tasks</th>
                  <th className="text-right p-3 font-normal">ORE</th>
                  <th className="text-right p-3 font-normal hidden md:table-cell">Rep</th>
                  <th className="text-center p-3 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((bot) => (
                  <tr key={bot.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <span className="mr-2">{bot.classEmoji}</span>
                      <span className="font-bold">{bot.callsign}</span>
                    </td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">{bot.className}</td>
                    <td className="p-3 text-right tabular">{bot.signalsMined}</td>
                    <td className="p-3 text-right tabular hidden md:table-cell">{bot.tasksCompleted}</td>
                    <td className="p-3 text-right tabular text-primary">{bot.creditsEarned}</td>
                    <td className="p-3 text-right tabular hidden md:table-cell">{bot.reputation}</td>
                    <td className="p-3 text-center">
                      {bot.activated ? (
                        <span className="text-green-500">✅</span>
                      ) : (
                        <span className="text-muted-foreground">⏸️</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contract Addresses */}
      {!loading && (
        <div className="mt-8">
          <div className="font-mono text-primary text-sm mb-4 tracking-widest">
            // CONTRACTS
          </div>
          <div className="border border-border">
            {Object.entries({
              "OREBOT Registry": CONTRACT_ADDRESSES.OREBOT_REGISTRY,
              "ORE Token": CONTRACT_ADDRESSES.ORE_TOKEN,
              "TREND Token": CONTRACT_ADDRESSES.TREND_TOKEN,
              "Payment Router": CONTRACT_ADDRESSES.AGENT_PAYMENT_ROUTER,
              "Marketplace": CONTRACT_ADDRESSES.OREBOT_MARKETPLACE,
              "Signal Staking": CONTRACT_ADDRESSES.SIGNAL_STAKING,
              "Buyback Burner": CONTRACT_ADDRESSES.TREND_BUYBACK_BURNER,
            }).map(([name, addr]) => (
              <div key={name} className="flex items-center justify-between p-3 border-b border-border last:border-0">
                <span className="font-mono text-sm text-muted-foreground">{name}</span>
                <a
                  href={`https://basescan.org/address/${addr}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-primary hover:underline"
                >
                  {addr.slice(0, 10)}...{addr.slice(-8)}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-border text-center font-mono text-xs text-muted-foreground">
        Mine the Signal. Ignore the Noise. ⛏️
      </div>
    </div>
  );
}
