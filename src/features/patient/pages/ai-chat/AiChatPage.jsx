import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaComments, FaHistory, FaHeart } from "react-icons/fa";
import { toast } from "react-hot-toast";
import ChatLayout from "@features/patient/components/new-chat/ChatLayout";
import PatientAiChat from "./PatientAiChat";
import AiChatHistoryPage from "./AiChatHistoryPage";
import AiChatFavoritesPage from "./AiChatFavoritesPage";
import {
  fetchMyChatConsultationById,
  fetchMyChatConsultations,
  generateChatMessage,
} from "@api/aiChat";

const AiChatPage = () => {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [consultations, setConsultations] = useState([]);
  const [isLoadingConsultations, setIsLoadingConsultations] = useState(false);
  const [activeConsultationId, setActiveConsultationId] = useState(null);

  const normalizeChatMessages = (detail, consultationId) => {
    const looksLikeAiRecipe = Boolean(
      detail &&
      (detail.recommendedRecipeName ||
        detail.mainHerb ||
        detail.scientificName ||
        detail.matchPercentage !== undefined ||
        detail.preparation ||
        detail.dosage ||
        detail.contraindications),
    );

    const raw =
      (Array.isArray(detail) ? detail : null) ||
      detail?.messages ||
      detail?.chatMessages ||
      detail?.history ||
      detail?.items;

    if (Array.isArray(raw)) {
      return raw
        .map((m, idx) => {
          const roleRaw = (m?.role || m?.sender || m?.type || "").toString();
          const role =
            roleRaw.toLowerCase() === "assistant" ||
            roleRaw.toLowerCase() === "ai"
              ? "ai"
              : roleRaw.toLowerCase() === "user"
                ? "user"
                : undefined;

          const content =
            typeof m?.content === "string"
              ? m.content
              : typeof m?.text === "string"
                ? m.text
                : typeof m?.message === "string"
                  ? m.message
                  : undefined;

          const data =
            m?.data && typeof m.data === "object"
              ? m.data
              : m?.response && typeof m.response === "object"
                ? m.response
                : undefined;

          if (!role) return null;
          if (!content && !data) return null;

          return {
            id: m?.id ?? `${consultationId || "chat"}-${idx}`,
            role,
            ...(content ? { content } : {}),
            ...(data ? { data } : {}),
            timestamp:
              m?.timestamp ||
              (m?.createdAt
                ? new Date(m.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : undefined),
          };
        })
        .filter(Boolean);
    }

    if (looksLikeAiRecipe) {
      return [
        {
          id: `${consultationId || "chat"}-ai`,
          role: "ai",
          data: detail,
        },
      ];
    }

    const userPrompt =
      detail?.userPrompt || detail?.prompt || detail?.question || detail?.input;
    const aiResponse =
      detail?.aiResponse ||
      detail?.responseData ||
      detail?.response ||
      detail?.result;

    const normalized = [];
    if (typeof userPrompt === "string" && userPrompt.trim()) {
      normalized.push({
        id: `${consultationId || "chat"}-user`,
        role: "user",
        content: userPrompt,
      });
    }

    if (aiResponse) {
      normalized.push({
        id: `${consultationId || "chat"}-ai`,
        role: "ai",
        ...(typeof aiResponse === "string"
          ? { content: aiResponse }
          : { data: aiResponse }),
      });
    }

    return normalized;
  };

  const loadConsultations = useCallback(async () => {
    setIsLoadingConsultations(true);
    try {
      const data = await fetchMyChatConsultations();
      const list = Array.isArray(data) ? data : data?.items || [];
      setConsultations(list);
    } catch (error) {
      console.error("Failed to load chat consultations:", error);
      toast.error(t("aiConsultation.myConsultations.messages.historyError"));
    } finally {
      setIsLoadingConsultations(false);
    }
  }, [t]);

  useEffect(() => {
    loadConsultations();
  }, [loadConsultations]);

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
      loadConsultations();
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
    setActiveConsultationId(null);
  };

  const handleSelectConsultation = async (id, item) => {
    if (!id) {
      setActiveConsultationId(null);
      if (item) {
        setMessages(normalizeChatMessages(item, null));
      }
      return;
    }

    setActiveConsultationId(id);

    try {
      const detail = await fetchMyChatConsultationById(id);
      const normalized = normalizeChatMessages(detail, id);
      setMessages(normalized);
    } catch (error) {
      console.error("Failed to load chat consultation:", error);
      toast.error(t("aiConsultation.myConsultations.messages.detailError"));
    }
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
        {activeView === "chat" && <PatientAiChat />}
        {activeView === "history" && <AiChatHistoryPage />}
        {activeView === "favorites" && <AiChatFavoritesPage />}
      </div>
      <ChatLayout
        messages={messages}
        isLoading={isLoading}
        consultations={consultations}
        isLoadingConsultations={isLoadingConsultations}
        onSelectConsultation={handleSelectConsultation}
        activeConsultationId={activeConsultationId}
        onSendMessage={handleSendMessage}
        onNewChat={handleNewChat}
      />
    </div>
  );
};

export default AiChatPage;
