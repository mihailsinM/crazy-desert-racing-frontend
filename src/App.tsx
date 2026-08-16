import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import "./styles/desert-ui/index.css";

import DashboardPage from "./pages/DashboardPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import MyCarsPage from "./pages/MyCarsPage";
import RacesPage from "./pages/RacesPage";
import VipClubPage from "./pages/VipClubPage";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/UserRegistrationPage";
import RaceDetailsPage from "./pages/RaceDetailsPage";
import AddRacePage from "./pages/AddRacePage";
import AddCarPage from "./pages/AddCarPage";
import EditRacePage from "./pages/EditRacePage";
import CarDetailsPage from "./pages/CarDetailsPage";
import EditCarPage from "./pages/EditCarPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminRoute from "./routes/AdminRoute";
import { useAuth } from "./context/authContext";

function App() {
  const { isAuthenticated, sessionChecked } = useAuth();

  if (!sessionChecked) {
    return <p className="du-sand-text">Checking your session...</p>;
  }

  return (
    <BrowserRouter>
      <main className="app">
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LoginPage />
              )
            }
          />

          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            element={
              isAuthenticated ? (
                <DashboardLayout />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          >
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsersPage />
                </AdminRoute>
              }
            />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/cars/:id/edit" element={<EditCarPage />} />
            <Route path="/cars/:id" element={<CarDetailsPage />} />
            <Route path="/cars" element={<MyCarsPage />} />
            <Route path="/cars/new" element={<AddCarPage />} />
            <Route path="/races" element={<RacesPage />} />
            <Route path="/races/new" element={<AddRacePage />} />
            <Route path="/races/:id" element={<RaceDetailsPage />} />
            <Route path="/races/:id/edit" element={<EditRacePage />} />
            <Route path="/vip" element={<VipClubPage />} />
          </Route>
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
