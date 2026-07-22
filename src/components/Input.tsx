import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  startIcon?: ReactNode;
}

// Reusable labeled input.
const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      label,
      error,
      hint,
      startIcon,
      id,
      className = '',
      ...props
    },
    ref,
  ) {
    const inputId = id ?? props.name;

    const descriptionId = error
      ? `${inputId ?? 'input'}-error`
      : hint
        ? `${inputId ?? 'input'}-hint`
        : undefined;

    return (
      <label
        className="ui-field"
        htmlFor={inputId}
      >
        {label ? (
          <span className="ui-field-label">
            {label}
          </span>
        ) : null}

        <span
          className={`ui-input-wrapper ${
            error ? 'ui-input-error' : ''
          }`}
        >
          {startIcon ? (
            <span className="ui-input-icon">
              {startIcon}
            </span>
          ) : null}

          <input
            {...props}
            ref={ref}
            id={inputId}
            className={`ui-input ${className}`}
            aria-invalid={Boolean(error)}
            aria-describedby={descriptionId}
          />
        </span>

        {error ? (
          <span
            className="ui-field-message ui-field-error"
            id={descriptionId}
          >
            {error}
          </span>
        ) : hint ? (
          <span
            className="ui-field-message"
            id={descriptionId}
          >
            {hint}
          </span>
        ) : null}
      </label>
    );
  },
);

export default Input;