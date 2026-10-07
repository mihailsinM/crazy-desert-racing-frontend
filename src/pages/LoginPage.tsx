import { useState } from "react";
import PasswordInput from "../components/auth/PasswordInput";
import { login, LoginRequestError } from "../services/authService";
import logo from "../assets/logo.png";
import "../styles/auth-page.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailReviewed, setEmailReviewed] = useState(false);
  const [passwordReviewed, setPasswordReviewed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [credentialsRejected, setCredentialsRejected] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  const emailError = !email.trim()
    ? "Enter your email."
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ? "Enter a valid email address."
      : "";
  const passwordError = password ? "" : "Enter your password.";
  const visibleEmailError = emailReviewed || submitted ? emailError : "";
  const visiblePasswordError = passwordReviewed || submitted ? passwordError : "";
  const credentialError = credentialsRejected ? "Email or password is incorrect." : "";

  function clearFeedback() {
    setSubmitted(false);
    setCredentialsRejected(false);
    setMessage("");
  }

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    setCredentialsRejected(false);
    setMessage("");

    if (emailError || passwordError || pending) {
      return;
    }

    setPending(true);
    try {
      await login({ email: email.trim(), password });
    } catch (error) {
      if (error instanceof LoginRequestError && (error.status === 401 || error.status === 403)) {
        setCredentialsRejected(true);
      } else {
        setMessage("Could not sign in. Please try again.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="auth-page du-page-scroll">
      <section className="auth-brand">
        <img src={logo} alt="Crazy Desert Racing logo" className="auth-logo" />

        <p className="auth-eyebrow">Crazy Desert Racing Club</p>

        <h1>Welcome back, racer.</h1>

        <p className="auth-description">
          Sign in to access your dashboard, cars, races and VIP club.
        </p>
      </section>

      <section className="auth-card">
        <h2>Member Login</h2>

        <form onSubmit={handleLogin} className="auth-form" noValidate>
          <label>
            Email
            <input
              type="email"
              className={(emailReviewed || submitted) && !emailError && !credentialsRejected ? "auth-field-valid" : undefined}
              value={email}
              placeholder="racer@email.com"
              maxLength={160}
              required
              autoComplete="username"
              aria-invalid={Boolean(visibleEmailError || credentialsRejected)}
              aria-describedby={visibleEmailError ? "login-email-error" : credentialsRejected ? "login-password-error" : undefined}
              onChange={(event) => {
                setEmail(event.target.value);
                setEmailReviewed(false);
                clearFeedback();
              }}
              onBlur={() => setEmailReviewed(true)}
            />
            {visibleEmailError && <span id="login-email-error" className="auth-field-error" role="alert">{visibleEmailError}</span>}
          </label>

          <PasswordInput
            id="login-password"
            label="Password"
            value={password}
            placeholder="••••••••"
            error={visiblePasswordError || credentialError}
            autoComplete="current-password"
            onChange={(value) => {
              setPassword(value);
              setPasswordReviewed(false);
              clearFeedback();
            }}
            onBlur={() => setPasswordReviewed(true)}
          />

          <button type="submit" disabled={pending}>{pending ? "Signing in..." : "Login"}</button>
        </form>

        {message && <p className="auth-message" role="alert">{message}</p>}
      </section>
    </main>
  );
}

export default LoginPage;
