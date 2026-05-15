import React from "react";
import ChatHistoryPanel from "./ChatHistoryPanel";
import ChatArea from "./ChatArea";
import ChatInput from "./ChatInput";

const ChatLayout = ({ messages, isLoading, onSendMessage, onNewChat }) => {
  return (
    <div className="flex h-[calc(100vh-80px)] w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-4">
      <ChatHistoryPanel messages={messages} onNewChat={onNewChat} />
      <div className="flex flex-col flex-1 relative">
        <ChatArea messages={messages} isLoading={isLoading} />
        <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatLayout;
