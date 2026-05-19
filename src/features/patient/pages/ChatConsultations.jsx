import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyConsultations } from "../../../api/aiChat";
import useAsyncAction from "../../../hooks/useAsyncAction";

const ChatConsultations = () => {
  const [consultations, setConsultations] = useState([]);
  const { performAction, isLoading, error } = useAsyncAction();

  useEffect(() => {
    const fetchConsultations = async () => {
      const data = await performAction(getMyConsultations());
      if (data) {
        setConsultations(data);
      }
    };
    fetchConsultations();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Consultations</h1>
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid gap-4">
        {consultations.length > 0 ? (
          consultations.map((consultation) => (
            <div key={consultation.id} className="p-4 border rounded-lg">
              <Link to={`/patient/chat/${consultation.id}`}>
                <h2 className="text-xl font-semibold">{consultation.title}</h2>
                <p className="text-gray-500">
                  {new Date(consultation.createdAt).toLocaleDateString()}
                </p>
              </Link>
            </div>
          ))
        ) : (
          <p>No consultations found.</p>
        )}
      </div>
    </div>
  );
};

export default ChatConsultations;