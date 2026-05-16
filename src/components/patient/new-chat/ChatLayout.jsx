import React, { useState } from "react";
import { FaBars } from "react-icons/fa";
import ChatHistoryPanel from "./ChatHistoryPanel";
import ChatArea from "./ChatArea";
import ChatInput from "./ChatInput";

const ChatLayout = ({ messages, isLoading, onSendMessage, onNewChat }) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <div className="flex h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
      <ChatHistoryPanel 
        messages={messages} 
        onNewChat={onNewChat} 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
      />
      <div className="flex flex-col flex-1 relative w-full overflow-hidden">
        {/* Mobile Header for toggle */}
        <div className="md:hidden flex items-center justify-between p-3 border-b border-slate-100 bg-white shadow-sm z-10">
          <span className="font-semibold text-slate-700">Chat Session</span>
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
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
