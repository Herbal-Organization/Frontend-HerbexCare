import MatchPercentageGauge from "./MatchPercentageGauge";
import { hasAiChatRecipeDisplayData } from "@features/patient/pages/ai-chat/aiChatRecipeUtils";
import {
  FaUser,
  FaRobot,
  FaLeaf,
  FaInfoCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

const ChatBubble = ({ message }) => {
  const isUser = message.role === "user";
  const showRecipeCard =
    !isUser && message.data && hasAiChatRecipeDisplayData(message.data);

  return (
    <div
      className={`flex w-full py-2 sm:py-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex w-full max-w-[min(100%,42rem)] gap-2 sm:max-w-[min(92%,36rem)] sm:gap-3 ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div className="shrink-0">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full shadow-sm sm:h-10 sm:w-10 ${
              isUser
                ? "bg-emerald-600 text-white"
                : "border border-slate-200 bg-white text-emerald-600 dark:border-slate-700 dark:bg-slate-800"
            }`}
          >
            {isUser ? (
              <FaUser className="h-4 w-4" />
            ) : (
              <FaRobot className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </div>
        </div>

        <div
          className={`flex min-w-0 flex-1 flex-col ${isUser ? "items-end" : "items-start"}`}
        >
          <div
            className={`w-full max-w-full ${
              isUser
                ? "rounded-2xl rounded-br-md bg-emerald-600 px-4 py-3 text-white shadow-md shadow-emerald-600/20 sm:px-5 sm:py-3.5"
                : "overflow-hidden rounded-2xl rounded-bl-md border border-slate-200/80 bg-white text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-900"
            }`}
          >
            {message.content ? (
              <div className="whitespace-pre-wrap text-sm leading-relaxed sm:text-[15px]">
                {message.content}
              </div>
            ) : null}

            {showRecipeCard ? (
              <div className="space-y-4 p-4 sm:p-5">
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    {message.data.recommendedRecipeName ? (
                      <h3 className="text-base font-black leading-snug text-slate-900 dark:text-white sm:text-lg">
                        {message.data.recommendedRecipeName}
                      </h3>
                    ) : null}
                    {message.data.mainHerb ? (
                      <div className="flex flex-wrap items-center gap-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                        <FaLeaf className="shrink-0" />
                        <span>{message.data.mainHerb}</span>
                        {message.data.scientificName ? (
                          <span className="font-normal italic text-slate-400">
                            ({message.data.scientificName})
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                    {message.data.category ? (
                      <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 sm:text-xs">
                        {message.data.category}
                      </span>
                    ) : null}
                  </div>
                  {message.data.matchPercentage !== undefined ? (
                    <div className="flex shrink-0 justify-center sm:justify-end">
                      <MatchPercentageGauge
                        percentage={message.data.matchPercentage}
                      />
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {message.data.preparation ? (
                    <div className="sm:col-span-2">
                      <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                        <FaInfoCircle className="text-slate-400" />
                        Preparation
                      </h4>
                      <p className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                        {message.data.preparation}
                      </p>
                    </div>
                  ) : null}
                  {message.data.dosage ? (
                    <div>
                      <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                        <FaInfoCircle className="text-slate-400" />
                        Dosage
                      </h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {message.data.dosage}
                      </p>
                    </div>
                  ) : null}
                  {message.data.contraindications ? (
                    <div className="sm:col-span-2">
                      <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-rose-600">
                        <FaExclamationTriangle className="text-rose-500" />
                        Contraindications
                      </h4>
                      <p className="rounded-xl border border-rose-100 bg-rose-50/80 p-3 text-sm leading-relaxed text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                        {message.data.contraindications}
                      </p>
                    </div>
                  ) : null}
                </div>

                {message.data.otherPossibilities?.length > 0 ? (
                  <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                    <h4 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Other possibilities
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {message.data.otherPossibilities.map((possibility, idx) => (
                        <span
                          key={idx}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {possibility}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : !isUser && message.data && !message.content ? (
              <div className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 sm:px-5 sm:py-4">
                Recipe details could not be displayed. Please try again.
              </div>
            ) : null}
          </div>

          <span className="mt-1.5 px-1 text-[10px] font-medium text-slate-400 sm:text-xs">
            {message.timestamp || "Just now"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
