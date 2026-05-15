import React from "react";
import MatchPercentageGauge from "./MatchPercentageGauge";
import { FaUser, FaRobot, FaLeaf, FaInfoCircle, FaExclamationTriangle } from "react-icons/fa";

const ChatBubble = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
              isUser ? "bg-primary text-white" : "bg-white border border-slate-200 text-primary"
            }`}
          >
            {isUser ? <FaUser className="w-5 h-5" /> : <FaRobot className="w-6 h-6" />}
          </div>
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
          <div
            className={`px-5 py-3.5 rounded-2xl shadow-sm ${
              isUser
                ? "bg-primary text-white rounded-tr-sm"
                : "bg-white border border-slate-100 text-slate-800 rounded-tl-sm w-full"
            }`}
          >
            {/* Render plain text if it exists */}
            {message.content && (
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
            )}

            {/* Render Structured AI Data if it exists */}
            {message.data && !isUser && (
              <div className="mt-2 space-y-4 w-full min-w-[280px] sm:min-w-[350px]">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    {message.data.recommendedRecipeName && (
                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        {message.data.recommendedRecipeName}
                      </h3>
                    )}
                    {message.data.mainHerb && (
                      <div className="flex items-center text-primary text-sm font-semibold">
                        <FaLeaf className="w-3.5 h-3.5 mr-1.5" />
                        {message.data.mainHerb}
                        {message.data.scientificName && (
                          <span className="text-slate-400 italic ml-1 font-normal">
                            ({message.data.scientificName})
                          </span>
                        )}
                      </div>
                    )}
                    {message.data.category && (
                      <span className="inline-block mt-2 px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                        {message.data.category}
                      </span>
                    )}
                  </div>
                  {message.data.matchPercentage !== undefined && (
                    <div className="ml-4 flex-shrink-0">
                      <MatchPercentageGauge percentage={message.data.matchPercentage} />
                    </div>
                  )}
                </div>

                <div className="space-y-3 text-sm">
                  {message.data.preparation && (
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                        <FaInfoCircle className="w-3.5 h-3.5 text-slate-400" /> Preparation
                      </h4>
                      <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {message.data.preparation}
                      </p>
                    </div>
                  )}
                  {message.data.dosage && (
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                        <FaInfoCircle className="w-3.5 h-3.5 text-slate-400" /> Dosage
                      </h4>
                      <p className="text-slate-600">{message.data.dosage}</p>
                    </div>
                  )}
                  {message.data.contraindications && (
                    <div>
                      <h4 className="font-semibold text-red-600 mb-1 flex items-center gap-1.5">
                        <FaExclamationTriangle className="w-3.5 h-3.5 text-red-500" /> Contraindications
                      </h4>
                      <p className="text-red-600/80 bg-red-50 p-2.5 rounded-lg border border-red-100">
                        {message.data.contraindications}
                      </p>
                    </div>
                  )}
                </div>

                {message.data.otherPossibilities && message.data.otherPossibilities.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Other Possibilities
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {message.data.otherPossibilities.map((possibility, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700 text-xs rounded-full border border-slate-200 cursor-pointer"
                        >
                          {possibility}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-1.5 px-1 font-medium">
            {message.timestamp || "Just now"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
