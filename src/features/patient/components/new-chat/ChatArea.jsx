import React, { useEffect, useRef } from "react";
import ChatBubble from "./ChatBubble";

const ChatArea = ({ messages, isLoading }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-slate-50 relative">
      <div className="max-w-4xl mx-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <span className="text-5xl text-primary" aria-hidden="true">✨</span>
            </div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">Welcome to AI Herbal Chat</h2>
            <p className="text-sm text-center max-w-sm">
              Describe your symptoms or ask about specific herbs to get personalized recommendations.
            </p>
          </div>
        ) : (
          messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)
        )}

        {isLoading && (
          <div className="flex w-full justify-start mb-6">
            <div className="flex gap-3 flex-row items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm bg-white border border-slate-200 text-primary">
                <span className="animate-pulse">🤖</span>
              </div>
              <div className="px-5 py-3.5 bg-white border border-slate-100 rounded-2xl rounded-tl-sm shadow-sm flex space-x-2">
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatArea;
