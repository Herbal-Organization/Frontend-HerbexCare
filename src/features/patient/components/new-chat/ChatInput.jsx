import React, { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { toast } from "react-hot-toast";

const ChatInput = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || isLoading) return;

    if (trimmed.length <= 50) {
      toast.error("Please enter a prompt longer than 50 characters.");
      return;
    }

    onSendMessage(trimmed);
    setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto relative flex flex-col gap-2"
      >
        <div className="relative">
          <textarea
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl sm:rounded-3xl pl-4 pr-12 sm:pl-6 sm:pr-14 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none custom-scrollbar transition-all"
            placeholder="Describe symptoms (e.g., headache, cough)..."
            rows="1"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            style={{ minHeight: "48px", maxHeight: "150px" }}
          />

          <button
            type="submit"
            disabled={message.trim().length <= 50 || isLoading}
            className={`absolute right-1.5 bottom-1.5 p-2.5 rounded-xl sm:rounded-full flex items-center justify-center transition-all ${
              message.trim().length > 50 && !isLoading
                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md active:scale-90"
                : "bg-slate-100 text-slate-300 cursor-not-allowed"
            }`}
          >
            <FaPaperPlane className="w-4 h-4" />
          </button>
        </div>

        {message.trim().length > 0 && message.trim().length <= 50 ? (
          <p className="px-2 text-[10px] sm:text-xs text-rose-500 font-medium">
            Please provide more detail (min 50 characters)
          </p>
        ) : null}
      </form>
    </div>
  );
};

export default ChatInput;
