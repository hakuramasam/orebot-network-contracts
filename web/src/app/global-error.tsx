"use client";

import { useEffect } from "react";

type NebulaError = { kind: string; message: string; stack?: string; at: number };

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    const w = window as Window & { __nebula_errors?: NebulaError[] };
    (w.__nebula_errors ??= []).push({ kind: "render", message: error.message, stack: error.stack, at: Date.now() });
    void fetch("/api/__nebula/logs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind: "render", message: error.message, stack: error.stack, at: Date.now() }),
      keepalive: true,
    }).catch(() => {});
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "ui-monospace, monospace", padding: "2rem", background: "#0a0a0a", color: "#fafafa" }}>
        <h1 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>This page hit a runtime error</h1>
        <pre style={{ whiteSpace: "pre-wrap", color: "#ef4444", fontSize: "0.85rem" }}>{error.message}</pre>
        {error.stack ? (
          <pre style={{ whiteSpace: "pre-wrap", opacity: 0.7, fontSize: "0.75rem", marginTop: "1rem" }}>{error.stack}</pre>
        ) : null}
        <button onClick={() => window.location.reload()} style={{ marginTop: "1.5rem", padding: "0.5rem 1rem" }}>
          Reload
        </button>
      </body>
    </html>
  );
}
