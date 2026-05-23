import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaComments, FaHistory, FaHeart } from "react-icons/fa";
import { toast } from "react-hot-toast";
import ChatLayout from "@features/patient/components/new-chat/ChatLayout";
import AiChatHistoryPage from "./AiChatHistoryPage";
import AiChatFavoritesPage from "./AiChatFavoritesPage";
import { generateChatMessage } from "@api/aiChat";

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
      toast.error("Failed to generate response. Please try again.");

      const errorMsg = {
        id: Date.now() + 1,
        role: "ai",
        content:
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
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-[61px] lg:top-0 z-20 shadow-sm overflow-hidden transition-all">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto no-scrollbar scroll-smooth">
            <button
              onClick={() => setActiveView("chat")}
              className={`px-4 sm:px-6 py-4 font-semibold text-xs sm:text-sm transition border-b-2 whitespace-nowrap flex items-center justify-center flex-1 sm:flex-none gap-2 ${
                activeView === "chat"
                  ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-900/10"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <FaComments className="text-base sm:text-lg" />
              <span>{t("patientSidebar.aiChat", "Chat")}</span>
            </button>
            <button
              onClick={() => setActiveView("history")}
              className={`px-4 sm:px-6 py-4 font-semibold text-xs sm:text-sm transition border-b-2 whitespace-nowrap flex items-center justify-center flex-1 sm:flex-none gap-2 ${
                activeView === "history"
                  ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-900/10"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <FaHistory className="text-base sm:text-lg" />
              <span>{t("aiChat.nav.history", "Chat History")}</span>
            </button>
            <button
              onClick={() => setActiveView("favorites")}
              className={`px-4 sm:px-6 py-4 font-semibold text-xs sm:text-sm transition border-b-2 whitespace-nowrap flex items-center justify-center flex-1 sm:flex-none gap-2 ${
                activeView === "favorites"
                  ? "border-rose-600 text-rose-600 dark:text-rose-400 bg-rose-50/30 dark:bg-rose-900/10"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <FaHeart className="text-base sm:text-lg" />
              <span>{t("aiChat.nav.favorites", "Favorites")}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl">
        {activeView === "chat" && (
          <ChatLayout
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onNewChat={handleNewChat}
          />
        )}

        {activeView === "history" && <AiChatHistoryPage />}
        {activeView === "favorites" && <AiChatFavoritesPage />}
      </div>
    </div>
  );
};

export default AiChatPage;
