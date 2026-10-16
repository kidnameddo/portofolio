// frontend/src/components/Modal.jsx
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Loading from "./Loading";

const Modal = ({
  children,
  isOpen,
  onClose,
  title,
  isLoading = false,
  loadingTitle = "Memproses..."
}) => {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const handleClose = () => {
    if (!isLoading) onCloseRef.current();
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isLoading) onCloseRef.current();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-backdrop" onClick={handleClose}>
      <section
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="modal-close"
          type="button"
          onClick={handleClose}
          disabled={isLoading}
          aria-label="Tutup dialog"
        >
          ×
        </button>
        {title && <h3 className="modal-title" id="modal-title">{title}</h3>}
        <div className="modal-body">{children}</div>
        {isLoading && <Loading type="modal" title={loadingTitle} />}
      </section>
    </div>,
    document.body
  );
};

export default Modal;