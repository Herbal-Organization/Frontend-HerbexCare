import { useEffect, useRef } from "react";
import { FaLeaf } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { MdOutlineChat } from "react-icons/md";
import ChatBubble from "./ChatBubble";

const SUGGESTED_PROMPTS = [
  "I have been feeling tired and low energy for a week. What herbs might help?",
  "Can you suggest something natural for mild stress and trouble sleeping?",
  "I have occasional digestive discomfort after meals. What gentle remedies exist?",
];

const ChatArea = ({ messages, isLoading, onSuggestionClick }) => {
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const showEmpty = messages.length === 0 && !isLoading;

  return (
    <div
      ref={scrollContainerRef}
      className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.06),transparent_55%)] bg-slate-50/80 dark:bg-slate-950/50"
    >
      <div className="mx-auto flex min-h-full max-w-3xl flex-col px-3 py-4 sm:px-5 sm:py-6">
        {showEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center py-8 sm:py-12">
            <div className="relative mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/30 sm:h-24 sm:w-24">
                <FaLeaf className="text-3xl sm:text-4xl" />
              </div>
              <span className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-white shadow-md">
                <HiSparkles className="text-sm" />
              </span>
            </div>

            <h2 className="text-center text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
              Welcome to AI Herbal Chat
            </h2>
            <p className="mt-2 max-w-md text-center text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
              Describe your symptoms in detail (at least 50 characters) to receive
              a personalized herbal recipe recommendation.
            </p>

            {onSuggestionClick ? (
              <div className="mt-8 w-full max-w-lg space-y-2">
                <p className="text-center text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Try asking
                </p>
                <div className="flex flex-col gap-2">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => onSuggestionClick?.(prompt)}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-xs font-medium leading-relaxed text-slate-700 shadow-sm transition-all hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-700 sm:text-sm"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-1 pb-2">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="flex w-full justify-start pb-4 pt-2">
            <div className="flex max-w-[90%] items-end gap-2 sm:max-w-[85%] sm:gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-emerald-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:h-10 sm:w-10">
                <MdOutlineChat className="text-lg" />
              </div>
              <div className="rounded-2xl rounded-bl-md border border-slate-100 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400 [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400 [animation-delay:300ms]" />
                </div>
                <p className="mt-2 text-xs font-medium text-slate-500">
                  Analyzing your symptoms…
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div ref={messagesEndRef} className="h-1 shrink-0" />
      </div>
    </div>
  );
};

export default ChatArea;
