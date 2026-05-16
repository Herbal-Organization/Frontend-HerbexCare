import React from "react";
import { FaHistory, FaRegCommentDots, FaTimes } from "react-icons/fa";

const ChatHistoryPanel = ({ messages, onNewChat, isOpen, onClose }) => {
  // Extract user messages to show as history items
  const userMessages = messages.filter((m) => m.role === "user").reverse();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-20 md:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={`
        absolute md:relative z-30 md:z-0
        w-64 md:w-72 bg-white border-r border-slate-200 flex flex-col h-full
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <FaHistory className="text-primary" /> History
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onNewChat();
                if (window.innerWidth < 768) onClose();
              }}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded font-medium transition-colors"
            >
              New
            </button>
            <button
              onClick={onClose}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {userMessages.length === 0 ? (
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
              <FaRegCommentDots className="text-slate-400 group-hover:text-primary transition-colors flex-shrink-0" />
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
