import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaComments, FaHistory, FaHeart, FaLeaf } from "react-icons/fa";
import { toast } from "react-hot-toast";
import ChatLayout from "@features/patient/components/new-chat/ChatLayout";
import AiChatHistoryPage from "./AiChatHistoryPage";
import AiChatFavoritesPage from "./AiChatFavoritesPage";
import { generateChatMessage } from "@api/aiChat";
import { parseApiError } from "@features/patient/pages/ai-pages/aiConsultationUtils";

const NAV_ITEMS = [
  { id: "chat", icon: FaComments, labelKey: "aiChatPage.nav.chat", fallback: "Chat" },
  {
    id: "history",
    icon: FaHistory,
    labelKey: "aiChatPage.nav.history",
    fallback: "History",
  },
  {
    id: "favorites",
    icon: FaHeart,
    labelKey: "aiChatPage.nav.favorites",
    fallback: "Favorites",
    accent: "rose",
  },
];

const AiChatPage = () => {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (userPrompt) => {
    if (!userPrompt.trim()) return;

    const newUserMsg = {
      id: Date.now(),
      role: "user",
      content: userPrompt,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const responseData = await generateChatMessage({ userPrompt });

      const newAiMsg = {
        id: Date.now() + 1,
        role: "ai",
        data: responseData,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, newAiMsg]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      const message = parseApiError(error);
      toast.error(message);

      const errorMsg = {
        id: Date.now() + 1,
        role: "ai",
        content:
          message ||
          "I'm sorry, I encountered an error while processing your request. Could you please try again?",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-linear-to-b from-emerald-50/40 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Page header */}
      <header className="shrink-0 border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
              <FaLeaf className="text-lg" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white sm:text-xl">
                {t("aiChatPage.title")}
              </h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 sm:text-sm">
                {t("aiChatPage.subtitle")}
              </p>
            </div>
          </div>

          {/* Segmented nav */}
          <nav
            className="flex gap-1 rounded-2xl border border-slate-200 bg-slate-100/80 p-1 dark:border-slate-700 dark:bg-slate-800/80"
            aria-label="AI chat sections"
          >
            {NAV_ITEMS.map(({ id, icon: Icon, labelKey, fallback, accent }) => {
              const isActive = activeView === id;
              const isRose = accent === "rose";

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveView(id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold transition-all sm:flex-none sm:px-4 sm:text-sm ${
                    isActive
                      ? isRose
                        ? "bg-white text-rose-600 shadow-sm dark:bg-slate-900 dark:text-rose-400"
                        : "bg-white text-emerald-700 shadow-sm dark:bg-slate-900 dark:text-emerald-400"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon className="shrink-0 text-sm" />
                  <span className="truncate">{t(labelKey, fallback)}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-3 py-3 sm:px-4 sm:py-4">
        {activeView === "chat" ? (
          <ChatLayout
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onNewChat={handleNewChat}
          />
        ) : null}

        {activeView === "history" ? (
          <div className="min-h-0 flex-1 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <AiChatHistoryPage />
          </div>
        ) : null}

        {activeView === "favorites" ? (
          <div className="min-h-0 flex-1 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <AiChatFavoritesPage />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AiChatPage;
