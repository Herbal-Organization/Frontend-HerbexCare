import React, { useState } from "react";
import { toast } from "react-hot-toast";
import ChatLayout from "@features/patient/components/new-chat/ChatLayout";
import { generateChatMessage } from "@api/aiChat";

const AiChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (userPrompt) => {
    if (!userPrompt.trim()) return;

    const newUserMsg = {
      id: Date.now(),
      role: "user",
      content: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const responseData = await generateChatMessage({ userPrompt });
      
      const newAiMsg = {
        id: Date.now() + 1,
        role: "ai",
        data: responseData,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages((prev) => [...prev, newAiMsg]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      toast.error("Failed to generate response. Please try again.");
      
      const errorMsg = {
        id: Date.now() + 1,
        role: "ai",
        content: "I'm sorry, I encountered an error while processing your request. Could you please try again?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  return (
    <div className="p-2 sm:p-4 lg:p-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="hidden md:block mb-2">
        <h1 className="text-2xl font-bold text-slate-800">AI Herbal Chat</h1>
        <p className="text-slate-500 text-sm mt-1">Get personalized herbal recommendations instantly.</p>
      </div>
      <ChatLayout
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onNewChat={handleNewChat}
      />
    </div>
  );
};

export default AiChatPage;
