import { useState } from "react";
import { login } from "../services/authService";
import logo from "../assets/logo.png";
import "../styles/login-page.css";

type LoginPageProps = {
  onLoginSuccess: () => void;
};

function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();

    try {
      const response = await login({ email, password });

      console.log(response.token);

      localStorage.setItem("token", response.token);

      onLoginSuccess();
    } catch {
      setMessage("Login failed. Check email or password.");
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand">
        <img src={logo} alt="Crazy Desert Racing logo" className="login-logo" />

        <p className="login-eyebrow">Crazy Desert Racing Club</p>

        <h1>Welcome back, racer.</h1>

        <p className="login-description">
          Sign in to access your dashboard, cars, races and VIP club.
        </p>
      </section>

      <section className="login-card">
        <h2>Member Login</h2>

        <form onSubmit={handleLogin} className="login-form">
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
            Password
            <input
              type="password"
              value={password}
              placeholder="••••••••"
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <button type="submit">Login</button>
        </form>

        {message && <p className="login-message">{message}</p>}
      </section>
    </main>
  );
}

export default LoginPage;
