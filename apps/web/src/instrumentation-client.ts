type NebulaError = { kind: string; message: string; stack?: string; at: number };

declare global {
  interface Window {
    __nebula_errors?: NebulaError[];
  }
}

const MAX_BUFFER = 50;

function stackOf(value: unknown): string | undefined {
  return value instanceof Error ? value.stack : undefined;
}

function record(kind: string, message: string, stack?: string): void {
  if (typeof window === "undefined") return;
  const buffer = (window.__nebula_errors ??= []);
  buffer.push({ kind, message: message.slice(0, 2000), stack: stack?.slice(0, 4000), at: Date.now() });
  if (buffer.length > MAX_BUFFER) buffer.splice(0, buffer.length - MAX_BUFFER);
  void fetch("/api/__nebula/logs", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ kind, message, stack, at: Date.now() }),
    keepalive: true,
  }).catch(() => {});
}

if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    record("error", event.message || "Uncaught error", stackOf(event.error));
  });
  window.addEventListener("unhandledrejection", (event) => {
    record("unhandledrejection", String(event.reason), stackOf(event.reason));
  });
  const originalError = console.error.bind(console);
  console.error = (...args: unknown[]): void => {
    const text = args.map((arg) => (arg instanceof Error ? arg.message : String(arg))).join(" ");
    record("console.error", text);
    originalError(...args);
  };
}

export {};
