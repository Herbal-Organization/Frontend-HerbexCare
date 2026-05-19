import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import ChatLayout from "@features/patient/components/new-chat/ChatLayout";
import {
  fetchMyChatConsultationById,
  fetchMyChatConsultations,
  generateChatMessage,
} from "@api/aiChat";
import { useTranslation } from "react-i18next";

const AiChatPage = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [consultations, setConsultations] = useState([]);
  const [isLoadingConsultations, setIsLoadingConsultations] = useState(false);
  const [activeConsultationId, setActiveConsultationId] = useState(null);

  const normalizeChatMessages = (detail, consultationId) => {
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
            roleRaw.toLowerCase() === "assistant" || roleRaw.toLowerCase() === "ai"
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

    // Fallback: attempt to build a 2-message conversation shape
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
        ...(typeof aiResponse === "string" ? { content: aiResponse } : { data: aiResponse }),
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

      // Refresh recent consultations in the background (if the backend persists chats)
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

  const handleSelectConsultation = async (id) => {
    if (!id) return;
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
    <div className="p-0 sm:p-4 lg:p-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="hidden md:block mb-4">
        <h1 className="text-2xl font-bold text-slate-800">AI Herbal Chat</h1>
        <p className="text-slate-500 text-sm mt-1">
          Get personalized herbal recommendations instantly.
        </p>
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
