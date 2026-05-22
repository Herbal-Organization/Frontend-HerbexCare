import React, { useState } from "react";
import { FaBars } from "react-icons/fa";
import ChatHistoryPanel from "./ChatHistoryPanel";
import ChatArea from "./ChatArea";
import ChatInput from "./ChatInput";

const ChatLayout = ({
  messages,
  isLoading,
  onSendMessage,
  onNewChat,
  consultations = [],
  isLoadingConsultations = false,
  onSelectConsultation,
  activeConsultationId,
}) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <div className="flex h-[calc(100dvh-64px)] sm:h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] w-full bg-white sm:rounded-2xl shadow-sm sm:border border-slate-200 overflow-hidden relative">
      <ChatHistoryPanel
        messages={messages}
        consultations={consultations}
        isLoadingConsultations={isLoadingConsultations}
        onSelectConsultation={onSelectConsultation}
        activeConsultationId={activeConsultationId}
        onNewChat={onNewChat}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
      <div className="flex flex-col flex-1 relative w-full overflow-hidden">
        {/* Mobile Header for toggle */}
        <div className="md:hidden flex items-center justify-between p-3 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 text-sm">
              AI Herbal Chat
            </span>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Online Assistant
            </span>
          </div>
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all border border-slate-100 active:scale-95"
            aria-label="Open History"
          >
            <FaBars />
          </button>
        </div>

        <ChatArea messages={messages} isLoading={isLoading} />
        <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatLayout;
