import React from "react";
import { FaHistory, FaRegCommentDots } from "react-icons/fa";

const ChatHistoryPanel = ({ messages, onNewChat }) => {
  // Extract user messages to show as history items
  const userMessages = messages.filter((m) => m.role === "user").reverse();

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-full hidden md:flex">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="font-bold text-slate-800 flex items-center gap-2">
          <FaHistory className="text-primary" /> History
        </h2>
        <button
          onClick={onNewChat}
          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded font-medium transition-colors"
        >
          New
        </button>
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
  );
};

export default ChatHistoryPanel;
