import {
  AlertTriangle,
  Trash2,
  X,
} from "lucide-react";
import { useEffect } from "react";
import "./ConfirmDialog.css";

function ConfirmDialog({
  isOpen,
  title = "Confirm action",
  message = "Are you sure you want to continue?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isLoading) {
        onCancel();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) {
    return null;
  }

  const Icon =
    variant === "danger"
      ? Trash2
      : AlertTriangle;

  return (
    <div
      className="confirm-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <div
        className="confirm-dialog__overlay"
        onClick={() => {
          if (!isLoading) {
            onCancel();
          }
        }}
      />

      <section className="confirm-dialog__content">
        <button
          type="button"
          className="confirm-dialog__close"
          aria-label="Close confirmation dialog"
          disabled={isLoading}
          onClick={onCancel}
        >
          <X size={19} />
        </button>

        <div
          className={`confirm-dialog__icon confirm-dialog__icon--${variant}`}
        >
          <Icon size={24} />
        </div>

        <div className="confirm-dialog__copy">
          <h2 id="confirm-dialog-title">
            {title}
          </h2>

          <p id="confirm-dialog-message">
            {message}
          </p>
        </div>

        <div className="confirm-dialog__actions">
          <button
            type="button"
            className="confirm-dialog__cancel"
            disabled={isLoading}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            className={`confirm-dialog__confirm confirm-dialog__confirm--${variant}`}
            disabled={isLoading}
            onClick={onConfirm}
          >
            {isLoading
              ? "Please wait..."
              : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

export default ConfirmDialog;