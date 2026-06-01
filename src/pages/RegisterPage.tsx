import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/registerService";
import logo from "../assets/logo.png";
import "../styles/login-page.css";

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

      localStorage.removeItem("token");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch {
      setMessage("Failed to create account. Please check your data.");
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand">
        <img src={logo} alt="Crazy Desert Racing logo" className="login-logo" />

        <p className="login-eyebrow">Join Crazy Desert Racing</p>

        <h1>Create your racer profile.</h1>

        <p className="login-description">
          Start your journey with the desert racing community, future events,
          VIP access and powerful cars.
        </p>
      </section>

      <section className="login-card">
        <h2>Create Account</h2>

        <form onSubmit={handleSubmit} className="login-form">
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

        {message && <p className="login-message">{message}</p>}

        <p className="login-message">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;
