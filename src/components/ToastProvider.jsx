import {
  CheckCircle2,
  Info,
  TriangleAlert,
  X,
  XCircle,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import "./ToastProvider.css";

const ToastContext = createContext(null);

const toastIcons = {
  success: CheckCircle2,
  error: XCircle,
  warning: TriangleAlert,
  info: Info,
};

const defaultDurations = {
  success: 3500,
  error: 5000,
  warning: 4500,
  info: 4000,
};

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeoutIdsRef = useRef(new Map());

  const removeToast = useCallback((toastId) => {
    const timeoutId =
      timeoutIdsRef.current.get(toastId);

    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutIdsRef.current.delete(toastId);
    }

    setToasts((currentToasts) =>
      currentToasts.filter(
        (toast) => toast.id !== toastId
      )
    );
  }, []);

  const showToast = useCallback(
    ({
      title,
      message = "",
      type = "info",
      duration,
      action,
    }) => {
      const validType = toastIcons[type]
        ? type
        : "info";

      const toastId =
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;

      const toastDuration =
        duration ??
        defaultDurations[validType];

      const newToast = {
        id: toastId,
        title:
          title ||
          (validType === "success"
            ? "Success"
            : validType === "error"
              ? "Something went wrong"
              : validType === "warning"
                ? "Attention"
                : "Information"),
        message,
        type: validType,
        action,
        duration: toastDuration,
      };

      setToasts((currentToasts) => [
        ...currentToasts,
        newToast,
      ]);

      if (toastDuration > 0) {
        const timeoutId = window.setTimeout(
          () => {
            removeToast(toastId);
          },
          toastDuration
        );

        timeoutIdsRef.current.set(
          toastId,
          timeoutId
        );
      }

      return toastId;
    },
    [removeToast]
  );

  const success = useCallback(
    (title, message = "", options = {}) =>
      showToast({
        title,
        message,
        type: "success",
        ...options,
      }),
    [showToast]
  );

  const error = useCallback(
    (title, message = "", options = {}) =>
      showToast({
        title,
        message,
        type: "error",
        ...options,
      }),
    [showToast]
  );

  const warning = useCallback(
    (title, message = "", options = {}) =>
      showToast({
        title,
        message,
        type: "warning",
        ...options,
      }),
    [showToast]
  );

  const info = useCallback(
    (title, message = "", options = {}) =>
      showToast({
        title,
        message,
        type: "info",
        ...options,
      }),
    [showToast]
  );

  const clearToasts = useCallback(() => {
    timeoutIdsRef.current.forEach(
      (timeoutId) => {
        window.clearTimeout(timeoutId);
      }
    );

    timeoutIdsRef.current.clear();
    setToasts([]);
  }, []);

  const contextValue = useMemo(
    () => ({
      showToast,
      success,
      error,
      warning,
      info,
      removeToast,
      clearToasts,
    }),
    [
      showToast,
      success,
      error,
      warning,
      info,
      removeToast,
      clearToasts,
    ]
  );
  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      <div
        className="toast-container"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => {
          const Icon =
            toastIcons[toast.type] || Info;

          return (
            <article
              className={`toast toast--${toast.type}`}
              key={toast.id}
              role={
                toast.type === "error"
                  ? "alert"
                  : "status"
              }
            >
              <div className="toast__icon">
                <Icon size={20} />
              </div>

              <div className="toast__content">
                <strong>{toast.title}</strong>

                {toast.message && (
                  <p>{toast.message}</p>
                )}

                {toast.action?.label &&
                  typeof toast.action.onClick ===
                    "function" && (
                    <button
                      type="button"
                      className="toast__action"
                      onClick={() => {
                        toast.action.onClick();
                        removeToast(toast.id);
                      }}
                    >
                      {toast.action.label}
                    </button>
                  )}
              </div>

              <button
                type="button"
                className="toast__close"
                aria-label={`Close ${toast.title} notification`}
                onClick={() =>
                  removeToast(toast.id)
                }
              >
                <X size={17} />
              </button>

              {toast.duration > 0 && (
                <span
                  className="toast__progress"
                  style={{
                    animationDuration: `${toast.duration}ms`,
                  }}
                />
              )}
            </article>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToast must be used inside ToastProvider."
    );
  }

  return context;
}

export { ToastProvider, useToast };