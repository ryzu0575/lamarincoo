"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { apiPost } from "@/lib/client";
import { useLocalStorage } from "@/lib/storage";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
}

interface InterviewChatProps {
  embedded?: boolean;
  initialRole?: string;
}

const PRESET_ROLES = [
  "Frontend Developer",
  "Backend / Fullstack",
  "Product Manager",
  "Digital Marketing",
  "Admin & Operasional",
  "Sales / BDM",
  "Fresh Graduate (Umum)",
];

const STARTER_PROMPTS = [
  {
    icon: "🌟",
    title: "Ceritakan tentang diri Anda",
    prompt: "Bagaimana cara terbaik dan formula menjawab 'Ceritakan tentang diri Anda' saat wawancara kerja?",
  },
  {
    icon: "🎯",
    title: "Metode STAR untuk Pertanyaan Perilaku",
    prompt: "Jelaskan cara menerapkan metode STAR (Situation, Task, Action, Result) untuk menjawab pertanyaan wawancara tentang pencapaian atau konflik kerja.",
  },
  {
    icon: "💰",
    title: "Tips Negosiasi Gaji",
    prompt: "Bagaimana cara elegan dan taktis menjawab pertanyaan 'Berapa ekspektasi gaji Anda?' tanpa menjual diri terlalu murah atau kemahalan?",
  },
  {
    icon: "⚠️",
    title: "Pertanyaan Jebakan HRD",
    prompt: "Apa saja pertanyaan jebakan yang paling sering ditanyakan oleh HRD di Indonesia dan bagaimana cara menjawabnya dengan aman?",
  },
  {
    icon: "❓",
    title: "Pertanyaan Balik untuk Pewawancara",
    prompt: "Berikan 5 pertanyaan cerdas dan berbobot yang bisa saya tanyakan kembali saat pewawancara bertanya 'Apakah ada pertanyaan untuk kami?'",
  },
  {
    icon: "🎙️",
    title: "Mulai Simulasi Wawancara",
    prompt: "Halo Coach Lamarin! Tolong mulai simulasi wawancara kerja untuk saya. Berikan pertanyaan pertama layaknya HRD profesional.",
  },
];

/** Parser Markdown sederhana & aman untuk chat response */
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];
  let currentQuote: string[] = [];

  const flushList = (keyPrefix: string) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`${keyPrefix}-list`} className="my-2.5 space-y-1.5 pl-5 list-disc text-ink/90">
          {currentList.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {formatInline(item)}
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const flushQuote = (keyPrefix: string) => {
    if (currentQuote.length > 0) {
      elements.push(
        <blockquote
          key={`${keyPrefix}-quote`}
          className="my-3 border-l-4 border-lavender-strong bg-surface-2/60 px-4 py-2.5 rounded-r-xl italic text-ink/90 shadow-sm"
        >
          {currentQuote.map((q, idx) => (
            <p key={idx} className="my-1">
              {formatInline(q)}
            </p>
          ))}
        </blockquote>
      );
      currentQuote = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Horizontal Rule
    if (/^---{3,}$/.test(trimmed)) {
      flushList(`hr-${index}`);
      flushQuote(`hr-${index}`);
      elements.push(<hr key={`hr-${index}`} className="my-4 border-line/60" />);
      return;
    }

    // Headings
    if (trimmed.startsWith("### ")) {
      flushList(`h3-${index}`);
      flushQuote(`h3-${index}`);
      elements.push(
        <h4 key={`h3-${index}`} className="mt-4 mb-2 font-display text-base font-bold text-lavender-strong">
          {formatInline(trimmed.replace("### ", ""))}
        </h4>
      );
      return;
    }
    if (trimmed.startsWith("## ")) {
      flushList(`h2-${index}`);
      flushQuote(`h2-${index}`);
      elements.push(
        <h3 key={`h2-${index}`} className="mt-5 mb-2 font-display text-lg font-bold text-sky-strong">
          {formatInline(trimmed.replace("## ", ""))}
        </h3>
      );
      return;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      flushList(`quote-${index}`);
      currentQuote.push(trimmed.replace("> ", ""));
      return;
    }

    // Bullet list
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      flushQuote(`bullet-${index}`);
      currentList.push(trimmed.slice(2));
      return;
    }

    // Regular line
    flushList(`p-${index}`);
    flushQuote(`p-${index}`);
    if (trimmed.length > 0) {
      elements.push(
        <p key={`p-${index}`} className="my-2 leading-relaxed text-ink/90">
          {formatInline(trimmed)}
        </p>
      );
    }
  });

  flushList("end");
  flushQuote("end");
  return elements;
}

/** Format inline bold, code/pill, and emphasis */
function formatInline(str: string): React.ReactNode {
  // Regex untuk **bold** dan `code`
  const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="rounded bg-lavender/30 px-1.5 py-0.5 text-xs font-mono text-lavender-strong">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

const CHAT_STORAGE_KEY = "lamarin:interview_chat_v1";

export default function InterviewChat({ embedded = false, initialRole = "" }: InterviewChatProps) {
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>(CHAT_STORAGE_KEY, []);
  const [input, setInput] = useState("");
  const [targetRole, setTargetRole] = useState(initialRole);
  const [mode, setMode] = useState<"tips" | "mock">("tips");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const content = (textToSend ?? input).trim();
    if (!content || loading) return;

    setErrorMsg(null);
    const userMsg: ChatMessage = {
      id: `u-${messages.length + 1}`,
      role: "user",
      content,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setLoading(true);

    try {
      const payloadMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await apiPost<{ reply: string; suggestions?: string[] }>("/api/chat-interview", {
        messages: payloadMessages,
        targetRole,
        mode,
      });

      const assistantMsg: ChatMessage = {
        id: `a-${newMessages.length + 1}`,
        role: "assistant",
        content: res.reply,
        suggestions: res.suggestions ?? [],
      };

      setMessages([...newMessages, assistantMsg]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat menghubungi Coach AI.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReset = () => {
    if (confirm("Mulai sesi baru? Riwayat obrolan ini akan dihapus.")) {
      setMessages([]);
      setErrorMsg(null);
    }
  };

  return (
    <div className={`card flex flex-col overflow-hidden border-line bg-surface ${embedded ? "h-[620px]" : "min-h-[700px]"} shadow-lift`}>
      {/* Top Header */}
      <div className="border-b border-line bg-surface-2/80 px-5 py-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-lavender to-sky border border-line text-xl shadow-sm">
              🎙️
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-surface bg-mint-strong" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-ink">Coach Lamarin</h3>
                <span className="chip bg-mint text-mint-strong text-[11px] py-0.5 px-2">AI Career Coach</span>
              </div>
              <p className="text-xs text-soft">Konsultasi tips lolos interview & simulasi wawancara kerja</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={handleReset}
                title="Hapus riwayat chat & mulai sesi baru"
                className="btn btn-soft text-xs py-1.5 px-3 border border-line text-soft hover:text-pink-strong transition-colors"
              >
                🔄 Reset Chat
              </button>
            )}
          </div>
        </div>

        {/* Setting Mode & Target Role Bar */}
        <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-line/50">
          <div className="inline-flex rounded-xl bg-surface p-1 border border-line text-xs font-semibold">
            <button
              onClick={() => setMode("tips")}
              className={`rounded-lg px-3 py-1 transition-colors ${mode === "tips" ? "bg-lavender text-lavender-strong shadow-xs font-bold" : "text-soft hover:text-ink"}`}
            >
              💡 Tanya Tips & Trik
            </button>
            <button
              onClick={() => setMode("mock")}
              className={`rounded-lg px-3 py-1 transition-colors ${mode === "mock" ? "bg-sky text-sky-strong shadow-xs font-bold" : "text-soft hover:text-ink"}`}
            >
              🎙️ Simulasi Interview
            </button>
          </div>

          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Posisi impian (mis. Frontend Dev, Admin, Sales...)"
              className="w-full rounded-xl border border-line bg-surface px-3 py-1 text-xs text-ink placeholder:text-soft/60 focus:border-lavender-strong"
            />
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.length === 0 ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-lavender/30 text-3xl mb-4 border border-line">
              ✨
            </div>
            <h4 className="font-display text-xl font-bold text-ink">
              Siap Lolos Interview & Diterima Kerja?
            </h4>
            <p className="mx-auto mt-2 max-w-md text-sm text-soft">
              Tanyakan apa saja kepada Coach Lamarin seputar pertanyaan HRD, tes teknis/user, metode STAR, negosiasi gaji, atau coba simulasi wawancara langsung.
            </p>

            {/* Role Pills */}
            <div className="mt-5 flex flex-wrap justify-center gap-1.5">
              <span className="text-xs text-soft self-center mr-1">Pilih peran cepat:</span>
              {PRESET_ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => setTargetRole(r)}
                  className={`rounded-full px-2.5 py-1 text-xs transition-colors border ${
                    targetRole === r
                      ? "border-lavender-strong bg-lavender text-lavender-strong font-bold"
                      : "border-line bg-surface-2 text-soft hover:text-ink hover:border-lavender"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Quick Starters */}
            <div className="mt-7 grid gap-3 sm:grid-cols-2 text-left max-w-2xl mx-auto">
              {STARTER_PROMPTS.map((sp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(sp.prompt)}
                  className="card card-hover flex items-start gap-3 p-3.5 text-left border-line hover:border-lavender-strong transition-all bg-surface-2/60 group"
                >
                  <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform">
                    {sp.icon}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-ink group-hover:text-lavender-strong transition-colors">
                      {sp.title}
                    </p>
                    <p className="text-[11px] text-soft line-clamp-2 mt-0.5 leading-tight">
                      {sp.prompt}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-lavender to-sky border border-line flex items-center justify-center text-sm shrink-0 mt-1">
                    🎙️
                  </div>
                )}

                <div
                  className={`relative max-w-[85%] rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 text-sm ${
                    isUser
                      ? "bg-gradient-to-r from-lavender-strong to-sky-strong text-white rounded-tr-xs shadow-md"
                      : "bg-surface-2 border border-line text-ink rounded-tl-xs shadow-soft"
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  ) : (
                    <div>
                      <div className="prose-dark">{renderMarkdown(m.content)}</div>

                      {/* Action Bar (Copy) */}
                      <div className="mt-3 flex items-center justify-between border-t border-line/40 pt-2 text-xs text-soft">
                        <span>Coach Lamarin</span>
                        <button
                          onClick={() => handleCopy(m.id, m.content)}
                          className="hover:text-lavender-strong transition-colors flex items-center gap-1 font-medium"
                        >
                          {copiedId === m.id ? "Tersalin! ✅" : "📋 Salin Jawaban"}
                        </button>
                      </div>

                      {/* Dynamic Suggestions from Gemini */}
                      {m.suggestions && m.suggestions.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-line/30 space-y-1.5">
                          <p className="text-[11px] font-bold text-lavender-strong">
                            💡 Pertanyaan lanjutan yang disarankan:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {m.suggestions.map((sug, sIdx) => (
                              <button
                                key={sIdx}
                                onClick={() => handleSend(sug)}
                                className="rounded-lg bg-surface border border-line px-2.5 py-1 text-xs text-ink/90 hover:border-lavender-strong hover:bg-lavender/30 transition-all text-left"
                              >
                                {sug} →
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="h-8 w-8 rounded-xl bg-surface-2 border border-line flex items-center justify-center text-xs shrink-0 mt-1 text-soft font-bold">
                    Kamu
                  </div>
                )}
              </motion.div>
            );
          })
        )}

        {/* Loading Indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3"
          >
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-lavender to-sky border border-line flex items-center justify-center text-sm shrink-0">
              🎙️
            </div>
            <div className="card rounded-2xl rounded-tl-xs px-4 py-3 bg-surface-2 border-line text-sm flex items-center gap-2.5">
              <span className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-lavender-strong animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-sky-strong animate-bounce [animation-delay:0.2s]" />
                <span className="h-2 w-2 rounded-full bg-mint-strong animate-bounce [animation-delay:0.4s]" />
              </span>
              <span className="text-xs text-soft font-medium">Coach Lamarin sedang berpikir & menyusun respons...</span>
            </div>
          </motion.div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="rounded-xl border border-pink-strong/40 bg-pink/20 p-3 text-xs text-pink-strong flex items-center justify-between">
            <span>⚠️ {errorMsg}</span>
            <button
              onClick={() => handleSend(messages[messages.length - 1]?.content)}
              className="underline font-bold ml-2 cursor-pointer"
            >
              Coba lagi
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-line bg-surface p-3 sm:p-4">
        <div className="relative flex items-end gap-2 rounded-2xl border border-line bg-surface-2 p-1.5 focus-within:border-lavender-strong transition-colors">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              mode === "mock"
                ? "Ketik jawaban Anda untuk disimulasikan..."
                : "Tanyakan tips interview (mis. 'Bagaimana trik menjawab kelemahan diri?')..."
            }
            className="w-full resize-none border-0 bg-transparent px-3 py-2 text-sm text-ink placeholder:text-soft/60 focus:outline-none"
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            aria-label="Kirim pertanyaan"
            className="btn btn-primary h-10 w-10 !p-0 rounded-xl shrink-0 flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
          >
            {loading ? (
              <span className="h-4 w-4 rounded-full border-2 border-surface border-t-transparent animate-spin" />
            ) : (
              "↑"
            )}
          </button>
        </div>
        <p className="mt-1.5 text-center text-[11px] text-soft">
          Tekan <kbd className="rounded border border-line px-1 py-0.5 bg-surface text-[10px]">Enter</kbd> untuk kirim, <kbd className="rounded border border-line px-1 py-0.5 bg-surface text-[10px]">Shift+Enter</kbd> baris baru.
        </p>
      </div>
    </div>
  );
}
