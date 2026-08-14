import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { removeToken } from "../services/authService";
import { registerUser } from "../services/userRegistrationService";
import logo from "../assets/logo.png";
import "../styles/auth-page.css";

function RegisterPage() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [licenseCategory, setLicenseCategory] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setMessage("");

      await registerUser({
        name,
        age: Number(age),
        email,
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
    <main className="auth-page">
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

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Name
            <input
              type="text"
              value={name}
              placeholder="Michael"
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <label>
            Age
            <input
              type="number"
              value={age}
              placeholder="39"
              onChange={(event) => setAge(event.target.value)}
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={email}
              placeholder="racer@email.com"
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label>
            License Category
            <input
              type="text"
              value={licenseCategory}
              placeholder="B"
              onChange={(event) => setLicenseCategory(event.target.value)}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              placeholder="••••••••"
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <button type="submit">Create Account</button>
        </form>

        {message && <p className="auth-message">{message}</p>}

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;
