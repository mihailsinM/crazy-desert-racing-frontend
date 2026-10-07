import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from "../components/auth/PasswordInput";
import DesertLiveMenuFilter from "../components/desert-live/DesertLiveMenuFilter";
import { removeToken } from "../services/authService";
import { registerUser } from "../services/userRegistrationService";
import logo from "../assets/logo.png";
import "../styles/auth-page.css";

const licenseCategoryOptions = [
  { value: "", label: "Choose a category", icon: "⌄", disabled: true },
  { value: "A", label: "A", icon: "🏍️" },
  { value: "B", label: "B", icon: "🚗" },
  { value: "C", label: "C", icon: "🚚" },
  { value: "D", label: "D", icon: "🚌" },
  { value: "Other", label: "Other", icon: "·" },
  { value: "No license", label: "No license", icon: "—" },
];

type RegistrationField = "name" | "age" | "email" | "license" | "password" | "confirm";

function RegisterPage() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [licenseCategory, setLicenseCategory] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [reviewedFields, setReviewedFields] = useState<Partial<Record<RegistrationField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  function markReviewed(field: RegistrationField) {
    setReviewedFields((current) => ({ ...current, [field]: true }));
  }

  function showError(field: RegistrationField, error: string, immediate = false) {
    return error && (immediate || submitted || reviewedFields[field]) ? error : "";
  }

  const nameError = name.trim() ? "" : "Enter your name.";
  const numericAge = Number(age);
  const ageError = !age
    ? "Enter your age."
    : !Number.isInteger(numericAge)
      ? "Enter a whole number for your age."
      : numericAge < 18
        ? "You must be at least 18 years old."
        : numericAge > 120
          ? "Enter an age of 120 or less."
          : "";
  const emailError = !email.trim()
    ? "Enter your email."
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ? "Enter a valid email address."
      : "";
  const licenseError = licenseCategory ? "" : "Choose a license category.";
  const passwordError = password.length >= 15 ? "" : "Use at least 15 characters.";
  const confirmError = !confirmPassword
    ? "Confirm your password."
    : confirmPassword !== password
      ? "Passwords do not match."
      : "";

  const visibleNameError = showError("name", nameError);
  const visibleAgeError = showError("age", ageError, age !== "");
  const visibleEmailError = showError("email", emailError);
  const visibleLicenseError = showError("license", licenseError);
  const visiblePasswordError = showError("password", passwordError);
  const visibleConfirmError = showError("confirm", confirmError);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setMessage("");

    if (nameError || ageError || emailError || licenseError || passwordError || confirmError) {
      return;
    }

    try {
      await registerUser({
        name: name.trim(),
        age: Number(age),
        email: email.trim(),
        licenseCategory,
        password,
      });

      setMessage("Account created successfully. Redirecting to login...");

      removeToken();

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch {
      setMessage("Failed to create account. Please check your data.");
    }
  }

  return (
    <main className="auth-page du-page-scroll">
      <section className="auth-brand">
        <img src={logo} alt="Crazy Desert Racing logo" className="auth-logo" />

        <p className="auth-eyebrow">Join Crazy Desert Racing</p>

        <h1>Create your racer profile.</h1>

        <p className="auth-description">
          Start your journey with the desert racing community, future events,
          VIP access and powerful cars.
        </p>
      </section>

      <section className="auth-card">
        <h2>Create Account</h2>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <label>
            Name
            <input
              type="text"
              className={!nameError ? "auth-field-valid" : undefined}
              value={name}
              placeholder="Your name"
              maxLength={80}
              required
              autoComplete="name"
              onChange={(event) => setName(event.target.value)}
              onBlur={() => markReviewed("name")}
              aria-invalid={Boolean(visibleNameError)}
              aria-describedby={visibleNameError ? "registration-name-error" : undefined}
            />
            {visibleNameError && <span id="registration-name-error" className="auth-field-error" role="alert">{visibleNameError}</span>}
          </label>

          <label>
            Age
            <input
              type="number"
              className={!ageError ? "auth-field-valid" : undefined}
              value={age}
              placeholder="18 or older"
              min={18}
              max={120}
              required
              onChange={(event) => setAge(event.target.value)}
              onBlur={() => markReviewed("age")}
              aria-invalid={Boolean(visibleAgeError)}
              aria-describedby={visibleAgeError ? "registration-age-note registration-age-error" : "registration-age-note"}
            />
            <span id="registration-age-note" className="auth-field-note">
              Crazy Desert Racing accounts are currently available to adults 18+.
            </span>
            {visibleAgeError && <span id="registration-age-error" className="auth-field-error" role="alert">{visibleAgeError}</span>}
          </label>

          <label>
            Email
            <input
              type="email"
              className={!emailError ? "auth-field-valid" : undefined}
              value={email}
              placeholder="you@example.com"
              maxLength={160}
              required
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() => markReviewed("email")}
              aria-invalid={Boolean(visibleEmailError)}
              aria-describedby={visibleEmailError ? "registration-email-error" : undefined}
            />
            {visibleEmailError && <span id="registration-email-error" className="auth-field-error" role="alert">{visibleEmailError}</span>}
          </label>

          <div className={`auth-field${visibleLicenseError ? " auth-field-invalid" : ""}`}>
            <span>License Category</span>
            <DesertLiveMenuFilter
              buttonLabel="Choose a category"
              menuLabel="License category"
              value={licenseCategory}
              options={licenseCategoryOptions}
              onChange={setLicenseCategory}
              variant="SELECT"
            />
            {visibleLicenseError && <span className="auth-field-error" role="alert">{visibleLicenseError}</span>}
          </div>

          <PasswordInput
            id="registration-password"
            label="Create a password"
            value={password}
            placeholder="At least 15 characters"
            error={visiblePasswordError}
            valid={!passwordError}
            minLength={15}
            autoComplete="new-password"
            onChange={setPassword}
            onBlur={() => markReviewed("password")}
          />

          <PasswordInput
            id="registration-confirm-password"
            label="Confirm password"
            value={confirmPassword}
            placeholder="Repeat your password"
            error={visibleConfirmError}
            valid={!confirmError && !passwordError}
            minLength={15}
            autoComplete="new-password"
            onChange={setConfirmPassword}
            onBlur={() => markReviewed("confirm")}
          />

          <button type="submit">Create Account</button>
        </form>

        {message && <p className="auth-message" role="status">{message}</p>}

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;
