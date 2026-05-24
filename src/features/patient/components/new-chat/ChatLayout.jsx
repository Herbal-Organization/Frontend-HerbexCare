import ChatArea from "./ChatArea";
import ChatInput from "./ChatInput";
import { FaPlus, FaRobot } from "react-icons/fa";

const ChatLayout = ({ messages, isLoading, onSendMessage, onNewChat }) => {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/50 sm:rounded-3xl">
      {/* Chat toolbar */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-white/95 px-3 py-3 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
            <FaRobot className="text-lg" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-white sm:text-base">
              Herbal Assistant
            </p>
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Ready to help
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onNewChat}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95 dark:border-emerald-700 sm:px-4 sm:text-sm"
        >
          <FaPlus className="text-[10px] sm:text-xs" />
          <span className="hidden sm:inline">New chat</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      <ChatArea
        messages={messages}
        isLoading={isLoading}
        onSuggestionClick={onSendMessage}
      />
      <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default ChatLayout;
