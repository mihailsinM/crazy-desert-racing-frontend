import { useState } from "react";
import "./App.css";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  function handleLoginSuccess() {
    setToken(localStorage.getItem("token"));
  }

  return (
    <main className="app">
      {token ? (
        <DashboardPage />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </main>
  );
}

export default App;
