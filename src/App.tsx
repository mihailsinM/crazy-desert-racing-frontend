import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import DashboardPage from "./pages/DashboardPage";
import DashboardLayout from "./components/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import MyCarsPage from "./pages/MyCarsPage";
import RacesPage from "./pages/RacesPage";
import VipClubPage from "./pages/VipClubPage";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  function handleLoginSuccess() {
    setToken(localStorage.getItem("token"));
  }

  return (
    <BrowserRouter>
      <main className="app">
        <Routes>
  <Route
    path="/login"
    element={
      token ? (
        <Navigate to="/dashboard" replace />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )
    }
  />

  <Route
    path="/"
    element={<Navigate to={token ? "/dashboard" : "/login"} replace />}
  />

  <Route
    element={token ? <DashboardLayout /> : <Navigate to="/login" replace />}
  >
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/cars" element={<MyCarsPage />} />
    <Route path="/races" element={<RacesPage />} />
    <Route path="/vip" element={<VipClubPage />} />
  </Route>
</Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
