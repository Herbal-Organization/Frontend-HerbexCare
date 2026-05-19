import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getMyConsultationById } from "../../../api/aiChat";
import useAsyncAction from "../../../hooks/useAsyncAction";

const ChatConversation = () => {
  const { id } = useParams();
  const [consultation, setConsultation] = useState(null);
  const { performAction, isLoading, error } = useAsyncAction();

  useEffect(() => {
    const fetchConsultation = async () => {
      const data = await performAction(getMyConsultationById(id));
      if (data) {
        setConsultation(data);
      }
    };
    fetchConsultation();
  }, [id]);

  return (
    <div className="p-4">
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {consultation && (
        <div>
          <h1 className="text-2xl font-bold mb-4">{consultation.title}</h1>
          <div className="space-y-4">
            {consultation.messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg ${
                  message.sender === "user"
                    ? "bg-blue-100 text-right"
                    : "bg-gray-100"
                }`}
              >
                <p>{message.text}</p>
                <p className="text-xs text-gray-500">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatConversation;