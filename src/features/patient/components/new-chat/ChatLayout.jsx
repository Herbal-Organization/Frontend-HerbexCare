import React, { useState } from "react";
import ChatArea from "./ChatArea";
import ChatInput from "./ChatInput";

const ChatLayout = ({
  messages,
  isLoading,
  onSendMessage,
  onNewChat,
}) => {
  return (
    <div className="flex h-[calc(100dvh-64px)] sm:h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] w-full bg-white sm:rounded-2xl shadow-sm sm:border border-slate-200 overflow-hidden relative">
      <div className="flex flex-col flex-1 relative w-full overflow-hidden">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 text-sm sm:text-base">
              AI Herbal Chat
            </span>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Online Assistant
            </span>
          </div>
          <button
            onClick={onNewChat}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm active:scale-95"
          >
            New Chat
          </button>
        </div>

        <ChatArea messages={messages} isLoading={isLoading} />
        <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatLayout;
