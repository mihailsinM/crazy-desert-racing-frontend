import { useState } from "react";

type PasswordInputProps = {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  error: string;
  valid?: boolean;
  minLength?: number;
  autoComplete: "new-password" | "current-password";
  onChange: (value: string) => void;
  onBlur: () => void;
};

function PasswordInput({ id, label, value, placeholder, error, valid, minLength, autoComplete, onChange, onBlur }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-password-control">
        <input
          id={id}
          className={valid ? "auth-field-valid" : undefined}
          type={visible ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          minLength={minLength}
          required
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        />
        <button
          type="button"
          className="auth-password-toggle"
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
            {!visible && <path d="M3 21 21 3" />}
          </svg>
        </button>
      </div>
      {error && <span id={`${id}-error`} className="auth-field-error" role="alert">{error}</span>}
    </div>
  );
}

export default PasswordInput;
