import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPaperPlane } from "react-icons/fa";

const MIN_CHARS = 50;
const MAX_CHARS = 2000;

const ChatInput = ({ onSendMessage, isLoading }) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);

  const trimmed = message.trim();
  const charCount = trimmed.length;
  const canSend = charCount > MIN_CHARS && !isLoading;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSend) return;

    onSendMessage(trimmed);
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="shrink-0 border-t border-slate-200 bg-white/95 px-3 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sm:px-4 sm:py-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-3xl space-y-2"
      >
        <div className="flex items-end gap-2 sm:gap-3">
          <div className="relative min-w-0 flex-1">
            <textarea
              ref={textareaRef}
              className="block w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pe-4 text-sm leading-relaxed text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900 sm:rounded-3xl sm:px-5 sm:py-3.5 sm:text-[15px]"
              placeholder={t("aiChatPage.input.placeholder")}
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              maxLength={MAX_CHARS}
              aria-label={t("aiChatPage.input.ariaLabel")}
            />
          </div>

          <button
            type="submit"
            disabled={!canSend}
            aria-label={canSend ? t("aiChatPage.input.sendAriaLabel") : t("aiChatPage.input.minCharsAriaLabel")}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all sm:h-12 sm:w-12 sm:rounded-2xl ${
              canSend
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 active:scale-95"
                : "cursor-not-allowed bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600"
            }`}
          >
            <FaPaperPlane className="text-sm sm:text-base" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] sm:text-xs">
          <p
            className={`font-medium ${
              charCount > 0 && charCount <= MIN_CHARS
                ? "text-amber-600 dark:text-amber-400"
                : "text-slate-400"
            }`}
          >
            {charCount > 0 && charCount <= MIN_CHARS
              ? t("aiChatPage.input.moreCharsNeeded", { count: MIN_CHARS - charCount })
              : t("aiChatPage.input.shiftEnterHint")}
          </p>
          <p className="text-slate-400">
            {charCount}/{MAX_CHARS}
          </p>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
