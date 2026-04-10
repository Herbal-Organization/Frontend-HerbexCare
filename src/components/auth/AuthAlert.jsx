import { MdError } from "react-icons/md";
import { FaCircleCheck } from "react-icons/fa6";

const ALERT_STYLES = {
  error: {
    container: "bg-red-50 border-red-100 text-red-700",
    icon: <MdError className="text-red-600 mt-0.5 shrink-0" />,
  },
  success: {
    container: "bg-green-50 border-green-100 text-primary",
    icon: <FaCircleCheck className="text-primary mt-0.5 shrink-0" />,
  },
};

function AuthAlert({ message, type = "error" }) {
  if (!message) {
    return null;
  }

  const style = ALERT_STYLES[type] ?? ALERT_STYLES.error;

  return (
    <div
      className={`mb-6 flex items-start gap-3 rounded-xl border p-4 ${style.container}`}
    >
      {style.icon}
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export default AuthAlert;
