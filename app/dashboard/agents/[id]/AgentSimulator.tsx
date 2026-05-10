"use client";

import { FormEvent, useMemo, useState } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";

type AgentSimulatorProps = {
  agentId: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ProductList = {
  type: "product_list";
  title?: string;
  items: Array<{
    id: string | number;
    name: string;
    price?: string | null;
    currency?: string | null;
    stock_status?: string | null;
    permalink?: string | null;
    categories?: string[] | null;
  }>;
};

const SAMPLE_PROMPTS = [
  "Recommend a product for a first-time buyer",
  "Do you have this in stock?",
  "What is your shipping or return policy?",
];

function parseProductList(content: string): ProductList | null {
  const trimmed = content.trim();
  if (!trimmed.startsWith("{")) return null;

  try {
    const parsed = JSON.parse(trimmed) as ProductList;
    if (parsed?.type === "product_list" && Array.isArray(parsed.items)) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

function AssistantMessage({ content }: { content: string }) {
  const productList = useMemo(() => parseProductList(content), [content]);

  if (productList) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-semibold text-white">
          {productList.title ?? "Suggested products"}
        </p>
        <div className="grid gap-2">
          {productList.items.slice(0, 4).map((item) => (
            <a
              key={`${item.id}-${item.name}`}
              href={item.permalink ?? undefined}
              target={item.permalink ? "_blank" : undefined}
              rel={item.permalink ? "noopener noreferrer" : undefined}
              className="rounded-xl border border-slate-800 bg-slate-950/45 p-3 transition hover:border-emerald-400/40 hover:text-white"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {item.name}
                  </p>
                  {item.categories?.length ? (
                    <p className="mt-1 truncate text-[11px] text-slate-500">
                      {item.categories.slice(0, 2).join(", ")}
                    </p>
                  ) : null}
                </div>
                {[item.price, item.currency].filter(Boolean).length ? (
                  <span className="shrink-0 text-xs font-semibold text-emerald-200">
                    {[item.price, item.currency].filter(Boolean).join(" ")}
                  </span>
                ) : null}
              </div>
              {item.stock_status ? (
                <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                  {item.stock_status}
                </p>
              ) : null}
            </a>
          ))}
        </div>
      </div>
    );
  }

  return <p className="whitespace-pre-wrap text-sm leading-6">{content}</p>;
}

export default function AgentSimulator({ agentId }: AgentSimulatorProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  async function sendMessage(message: string) {
    const text = message.trim();
    if (!text || isSending) return;

    setError(null);
    setIsSending(true);
    setMessages((current) => [...current, { role: "user", content: text }]);
    setInput("");

    try {
      const res = await fetch(`/api/dashboard/agents/${agentId}/test-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: text }),
      });
      const data = (await res.json().catch(() => null)) as {
        reply?: string;
        error?: string;
      } | null;

      if (!res.ok) {
        throw new Error(data?.error ?? "Could not test this agent.");
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data?.reply ?? "No reply returned.",
        },
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not test this agent.";
      setError(message);
    } finally {
      setIsSending(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <article className="ui-card glass-pane p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
            Simulator
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Test this agent
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">
            Try real questions against the current prompt, catalog, and
            knowledge files. Test messages do not consume quota.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100">
          <Sparkles className="h-3.5 w-3.5" />
          Preview mode
        </span>
      </div>

      <div className="mt-5 min-h-64 rounded-2xl border border-slate-800 bg-slate-950/45 p-4">
        {messages.length === 0 ? (
          <div className="flex min-h-52 flex-col justify-center gap-3 text-sm text-slate-400">
            <p className="font-medium text-slate-200">Start with a scenario</p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void sendMessage(prompt)}
                  disabled={isSending}
                  className="rounded-full border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:border-emerald-400/50 hover:text-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex gap-3 ${isUser ? "justify-end" : ""}`}
                >
                  {!isUser && (
                    <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-200">
                      <Bot className="h-4 w-4" />
                    </span>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl border p-3 ${
                      isUser
                        ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-50"
                        : "border-slate-800 bg-slate-900/70 text-slate-200"
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap text-sm leading-6">
                        {message.content}
                      </p>
                    ) : (
                      <AssistantMessage content={message.content} />
                    )}
                  </div>
                  {isUser && (
                    <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-300">
                      <User className="h-4 w-4" />
                    </span>
                  )}
                </div>
              );
            })}
            {isSending && (
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
                Testing agent response...
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about products, shipping, sizing, returns..."
          className="ui-input min-w-0 flex-1"
          maxLength={2000}
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="ui-button ui-button--primary shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          Send test
        </button>
      </form>
    </article>
  );
}
