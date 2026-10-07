// "use client";

// import { useEffect, useRef, useState } from "react";
// import { Send, Loader2, Sparkles } from "lucide-react";
// import MessageBubble from "./MessageBubble";

// const SUGGESTIONS = [
//   "What's the process for VPN access?",
//   "How do I request a new laptop?",
//   "How do I reset my password?",
//   "I need access",
// ];

// export default function ChatPanel() {
//   const [hydrated, setHydrated] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [booting, setBooting] = useState(true);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const scrollRef = useRef(null);

//   useEffect(() => {
//     setHydrated(true);

//     let cancelled = false;
//     async function load() {
//       try {
//         const res = await fetch("/api/chat/session");
//         const data = await res.json();
//         if (cancelled || !res.ok) return;
//         const restored = (data.messages || []).map((m) => ({
//           id: m.id,
//           role: m.role,
//           text: m.content,
//           meta: m.meta || null,
//           sources: m.meta?.sources || [],
//         }));
//         setMessages(restored);
//       } catch {
//         // ignore
//       } finally {
//         if (!cancelled) setBooting(false);
//       }
//     }
//     load();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   useEffect(() => {
//     scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
//   }, [messages, loading]);

//   function buildAssistantMessage(decision, sources, ticket, serverText) {
//     const meta = {
//       type: decision.action,
//       citations: decision.citations || [],
//       ticket: decision.ticket || null,
//       sources,
//       ticketId: ticket?.id || null,
//       ticketNumber: ticket?.number || null,
//     };

//     let text = serverText || "";
//     if (!text) {
//       if (decision.action === "answer") text = decision.answer || "";
//       if (decision.action === "clarify") {
//         text = `I need a bit more info before I can help:\n\n${(decision.questions || [])
//           .map((q, i) => `${i + 1}. ${q}`)
//           .join("\n")}`;
//       }
//     }

//     return { id: crypto.randomUUID(), role: "assistant", text, meta, sources };
//   }

//   async function send(question) {
//     const q = (question || "").trim();
//     if (!q || loading) return;

//     setError("");
//     setInput("");

//     const userMsg = { id: crypto.randomUUID(), role: "user", text: q };
//     setMessages((prev) => [...prev, userMsg]);
//     setLoading(true);

//     try {
//       const res = await fetch("/api/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ question: q }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Request failed");

//       const assistantMsg = buildAssistantMessage(
//         data.decision,
//         data.sources,
//         data.ticket,
//         data.assistantText
//       );
//       setMessages((prev) => [...prev, assistantMsg]);
//     } catch (e) {
//       setError(e.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   }

//   function onSubmit(e) {
//     e.preventDefault();
//     send(input);
//   }

//   const showEmpty = hydrated && !booting && messages.length === 0 && !loading;
//   const showLoader = hydrated && (booting || loading);

//   return (
//     <div className="card flex flex-col h-[72vh] overflow-hidden">
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {!hydrated && <div className="h-4" />}

//         {showLoader && (
//           <div className="flex items-center gap-2 text-sm text-white/50">
//             <Loader2 className="w-4 h-4 animate-spin" />
//             {booting ? "Loading conversation…" : "Thinking…"}
//           </div>
//         )}

//         {showEmpty && (
//           <div className="text-center pt-10">
//             <div className="mx-auto w-12 h-12 rounded-xl bg-brand-500/15 flex items-center justify-center mb-4">
//               <Sparkles className="w-6 h-6 text-brand-300" />
//             </div>
//             <h2 className="font-medium">Ask anything about your company policies</h2>
//             <p className="text-sm text-white/50 mt-1 max-w-sm mx-auto">
//               If it&apos;s covered, I&apos;ll answer. If not, I&apos;ll route it to the right team.
//             </p>
//             <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
//               {SUGGESTIONS.map((s) => (
//                 <button
//                   key={s}
//                   type="button"
//                   onClick={() => send(s)}
//                   className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-brand-500/40 hover:bg-brand-500/10 transition"
//                 >
//                   {s}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}

//         {messages.map((m) => (
//           <MessageBubble key={m.id} message={m} />
//         ))}

//         <div ref={scrollRef} />
//       </div>

//       {error && (
//         <div className="px-4 py-2 text-xs text-red-300 bg-red-500/10 border-t border-red-500/20">
//           {error}
//         </div>
//       )}

//       <form onSubmit={onSubmit} className="border-t border-white/10 p-3 flex gap-2">
//         <input
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="Ask about policies, access, requests…"
//           disabled={loading}
//           className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-brand-500 outline-none text-sm disabled:opacity-60"
//         />
//         <button
//           type="submit"
//           disabled={loading || !input.trim()}
//           className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 transition text-sm disabled:opacity-60"
//         >
//           {loading ? (
//             <Loader2 className="w-4 h-4 animate-spin" />
//           ) : (
//             <Send className="w-4 h-4" />
//           )}
//           Send
//         </button>
//       </form>
//     </div>
//   );
// }






"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Sparkles, Mic, MicOff } from "lucide-react";
import MessageBubble from "./MessageBubble";

const SUGGESTIONS = [
  "What's the process for VPN access?",
  "How do I request a new laptop?",
  "How do I reset my password?",
  "I need access",
];

export default function ChatPanel() {
  const [hydrated, setHydrated] = useState(false);
  const [messages, setMessages] = useState([]);
  const [booting, setBooting] = useState(true);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const recognitionRef = useRef(null);

  const scrollRef = useRef(null);

  useEffect(() => {
    setHydrated(true);

    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/chat/session");
        const data = await res.json();
        if (cancelled || !res.ok) return;
        const restored = (data.messages || []).map((m) => ({
          id: m.id,
          role: m.role,
          text: m.content,
          meta: m.meta || null,
          sources: m.meta?.sources || [],
        }));
        setMessages(restored);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setBooting(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Detect voice support on mount (WITH DEBUG LOGS)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SR =
      window.SpeechRecognition || window.webkitSpeechRecognition || null;

    console.log("[voice] SR available?", !!SR);
    console.log("[voice] userAgent:", navigator.userAgent);
    console.log("[voice] has navigator.brave:", "brave" in navigator);

    if (SR) {
      setVoiceSupported(true);
      const rec = new SR();
      rec.lang = "en-IN";
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        console.log("[voice] onstart");
        setListening(true);
      };

      rec.onaudiostart = () => console.log("[voice] onaudiostart");
      rec.onaudioend = () => console.log("[voice] onaudioend");
      rec.onsoundstart = () => console.log("[voice] onsoundstart");
      rec.onsoundend = () => console.log("[voice] onsoundend");
      rec.onspeechstart = () => console.log("[voice] onspeechstart");
      rec.onspeechend = () => console.log("[voice] onspeechend");

      rec.onresult = (event) => {
        console.log("[voice] onresult event:", event);
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) final += transcript;
          else interim += transcript;
        }
        console.log("[voice] interim:", interim, "| final:", final);
        if (final) {
          setInput((prev) => (prev ? prev + " " + final.trim() : final.trim()));
        }
      };

      rec.onerror = (event) => {
        console.error("[voice] onerror:", event.error, event.message);
        setListening(false);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setVoiceError("Microphone permission denied.");
        } else if (event.error === "no-speech") {
          setVoiceError("Didn't catch that. Try again.");
        } else if (event.error === "network") {
          setVoiceError("Network error — speech service unreachable.");
        } else if (event.error === "aborted") {
          setVoiceError("Recording was cancelled.");
        } else {
          setVoiceError(`Voice error: ${event.error}`);
        }
        setTimeout(() => setVoiceError(""), 4000);
      };

      rec.onend = () => {
        console.log("[voice] onend");
        setListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  function startListening() {
    if (!recognitionRef.current || listening) return;
    setVoiceError("");
    console.log("[voice] calling .start()");
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch (err) {
      console.error("[voice] start() threw:", err);
    }
  }

   function startListening() {
    if (!recognitionRef.current) return;
    setVoiceError("");
    console.log("[voice] calling .start()");
    try {
      // Abort any stale session first
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore — was never started
      }
      recognitionRef.current.start();
      setListening(true);
    } catch (err) {
      console.error("[voice] start() threw:", err);
      setVoiceError("Could not start mic. Try again.");
      setTimeout(() => setVoiceError(""), 3000);
    }
  }

  function toggleVoice() {
    if (listening) stopListening();
    else startListening();
  }

  function buildAssistantMessage(decision, sources, ticket, serverText) {
    const meta = {
      type: decision.action,
      citations: decision.citations || [],
      ticket: decision.ticket || null,
      sources,
      ticketId: ticket?.id || null,
      ticketNumber: ticket?.number || null,
      confidence: decision.confidence ?? null,
    };

    let text = serverText || "";
    if (!text) {
      if (decision.action === "answer") text = decision.answer || "";
      if (decision.action === "clarify") {
        text = `I need a bit more info before I can help:\n\n${(decision.questions || [])
          .map((q, i) => `${i + 1}. ${q}`)
          .join("\n")}`;
      }
    }

    return { id: crypto.randomUUID(), role: "assistant", text, meta, sources };
  }

  async function send(question) {
    const q = (question || "").trim();
    if (!q || loading) return;

    if (listening) stopListening();

    setError("");
    setInput("");

    const userMsg = { id: crypto.randomUUID(), role: "user", text: q };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      const assistantMsg = buildAssistantMessage(
        data.decision,
        data.sources,
        data.ticket,
        data.assistantText
      );
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    send(input);
  }

  const showEmpty = hydrated && !booting && messages.length === 0 && !loading;
  const showLoader = hydrated && (booting || loading);

  return (
    <div className="card flex flex-col h-[72vh] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!hydrated && <div className="h-4" />}

        {showLoader && (
          <div className="flex items-center gap-2 text-sm text-white/50">
            <Loader2 className="w-4 h-4 animate-spin" />
            {booting ? "Loading conversation…" : "Thinking…"}
          </div>
        )}

        {showEmpty && (
          <div className="text-center pt-10">
            <div className="mx-auto w-12 h-12 rounded-xl bg-brand-500/15 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-brand-300" />
            </div>
            <h2 className="font-medium">Ask anything about your company policies</h2>
            <p className="text-sm text-white/50 mt-1 max-w-sm mx-auto">
              If it&apos;s covered, I&apos;ll answer. If not, I&apos;ll route it to the right team.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-brand-500/40 hover:bg-brand-500/10 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}

        <div ref={scrollRef} />
      </div>

      {error && (
        <div className="px-4 py-2 text-xs text-red-300 bg-red-500/10 border-t border-red-500/20">
          {error}
        </div>
      )}

      {voiceError && (
        <div className="px-4 py-2 text-xs text-yellow-300 bg-yellow-500/10 border-t border-yellow-500/20">
          {voiceError}
        </div>
      )}

      <form onSubmit={onSubmit} className="border-t border-white/10 p-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            listening
              ? "Listening… speak now"
              : "Ask about policies, access, requests…"
          }
          disabled={loading}
          className={`flex-1 px-3 py-2 rounded-lg bg-white/5 border outline-none text-sm disabled:opacity-60 transition ${
            listening
              ? "border-brand-500 ring-2 ring-brand-500/30"
              : "border-white/10 focus:border-brand-500"
          }`}
        />

        {voiceSupported && (
          <button
            type="button"
            onClick={toggleVoice}
            disabled={loading}
            title={listening ? "Stop recording" : "Speak your question"}
            className={`inline-flex items-center justify-center w-10 h-10 rounded-lg transition disabled:opacity-60 ${
              listening
                ? "bg-red-500/20 border border-red-500/40 text-red-300 animate-pulse"
                : "border border-white/10 text-white/60 hover:border-brand-500/40 hover:text-brand-300"
            }`}
          >
            {listening ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>
        )}

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 transition text-sm disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Send
        </button>
      </form>
    </div>
  );
}