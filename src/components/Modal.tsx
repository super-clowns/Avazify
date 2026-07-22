import {
  useEffect,
  type ReactNode,
} from 'react';

export interface ModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  size?: 'small' | 'medium' | 'large';
}

// Accessible modal shell.
export default function Modal({
  isOpen,
  title,
  children,
  onClose,
  footer,
  size = 'medium',
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    window.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="ui-modal-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className={`ui-modal ui-modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <header className="ui-modal-header">
          <h2 id="modal-title">{title}</h2>

          <button
            type="button"
            className="ui-icon-button"
            onClick={onClose}
            aria-label="بستن پنجره"
          >
            ×
          </button>
        </header>

        <div className="ui-modal-body">
          {children}
        </div>

        {footer ? (
          <footer className="ui-modal-footer">
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  );
}