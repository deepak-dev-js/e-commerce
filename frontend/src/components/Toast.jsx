import { useEffect } from "react";
import { CheckCircle } from "lucide-react";

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(onClose, 2000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-[100] flex w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-xl bg-neutral-900 px-5 py-3.5 text-sm font-medium text-white shadow-xl animate-[slideUp_0.25s_ease-out]"
    >
      <CheckCircle size={20} className="shrink-0 text-white" />
      <span>{message}</span>

      <style>
        {`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translate(-50%, 16px);
            }
            to {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Toast;
