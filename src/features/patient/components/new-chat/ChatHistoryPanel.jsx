import React from "react";
import { FaHistory, FaRegCommentDots, FaTimes } from "react-icons/fa";

const ChatHistoryPanel = ({
  messages,
  consultations = [],
  isLoadingConsultations = false,
  onSelectConsultation,
  activeConsultationId,
  onNewChat,
  isOpen,
  onClose,
}) => {
  // Extract user messages to show as fallback history items
  const userMessages = messages.filter((m) => m.role === "user").reverse();

  const getConsultationId = (item) =>
    item?.id ?? item?.consultationId ?? item?.chatId ?? item?.sessionId;

  const getConsultationTitle = (item, idx) => {
    const raw =
      item?.recommendedRecipeName ||
      item?.recipeName ||
      item?.title ||
      item?.name ||
      item?.subject ||
      item?.lastUserMessage ||
      item?.lastPrompt ||
      item?.userPrompt ||
      item?.prompt;
    const title = typeof raw === "string" ? raw.trim() : "";
    return title || `Consultation #${idx + 1}`;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`
        fixed md:relative z-30 md:z-0
        w-70 md:w-72 bg-white border-r border-slate-200 flex flex-col h-full
        transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <FaHistory className="text-emerald-600" /> Recent Chats
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onNewChat();
                if (window.innerWidth < 768) onClose();
              }}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm active:scale-95"
            >
              New
            </button>
            <button
              onClick={onClose}
              className="md:hidden p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {isLoadingConsultations ? (
            <div className="text-center text-sm text-slate-400 mt-10">
              Loading...
            </div>
          ) : consultations.length > 0 ? (
            consultations.map((item, idx) => {
              const id = getConsultationId(item);
              const isActive = id && activeConsultationId
                ? String(id) === String(activeConsultationId)
                : false;

              return (
                <div
                  key={id || idx}
                  className={`px-3 py-2.5 rounded-lg cursor-pointer flex items-center gap-3 transition-colors border group ${
                    isActive
                      ? "bg-emerald-50 border-emerald-100"
                      : "border-transparent hover:bg-slate-50 hover:border-slate-100"
                  }`}
                  onClick={() => {
                    if (typeof onSelectConsultation === "function") {
                      onSelectConsultation(id, item);
                    }
                    if (window.innerWidth < 768) onClose();
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    if (typeof onSelectConsultation === "function") {
                      onSelectConsultation(id, item);
                    }
                    if (window.innerWidth < 768) onClose();
                  }}
                >
                  <FaRegCommentDots
                    className={`transition-colors shrink-0 ${
                      isActive
                        ? "text-emerald-700"
                        : "text-slate-400 group-hover:text-primary"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-slate-700 truncate font-medium">
                      {getConsultationTitle(item, idx)}
                    </div>
                  </div>
                </div>
              );
            })
          ) : userMessages.length === 0 ? (
            <div className="text-center text-sm text-slate-400 mt-10">
              No history yet
            </div>
          ) : (
            userMessages.map((msg, idx) => (
              <div
                key={idx}
                className="px-3 py-2.5 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors border border-transparent hover:border-slate-100 group"
                onClick={() => {
                  if (window.innerWidth < 768) onClose();
                }}
              >
                <FaRegCommentDots className="text-slate-400 group-hover:text-primary transition-colors shrink-0" />
                <div className="text-sm text-slate-700 truncate font-medium">
                  {msg.content}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default ChatHistoryPanel;
