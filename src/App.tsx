import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./App.css";
import "./styles/desert-ui/index.css";

import DashboardPage from "./pages/DashboardPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import MyCarsPage from "./pages/MyCarsPage";
import MarketplacePage from "./pages/MarketplacePage";
import MarketplaceEditorPage from "./pages/MarketplaceEditorPage";
import MarketplaceDetailsPage from "./pages/MarketplaceDetailsPage";
import FestivalsPage from "./pages/FestivalsPage";
import FestivalDetailsPage from "./pages/FestivalDetailsPage";
import RacesPage from "./pages/RacesPage";
import VipClubPage from "./pages/VipClubPage";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/UserRegistrationPage";
import RaceDetailsPage from "./pages/RaceDetailsPage";
import AddRacePage from "./pages/AddRacePage";
import AddCarPage from "./pages/AddCarPage";
import EditRacePage from "./pages/EditRacePage";
import CarDetailsPage from "./pages/CarDetailsPage";
import CarGalleryPage from "./pages/CarGalleryPage";
import EditCarPage from "./pages/EditCarPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import DesertLiveDetailsPage from "./pages/DesertLiveDetailsPage";
import DesertLiveEditorPage from "./pages/DesertLiveEditorPage";
import DesertLivePage from "./pages/DesertLivePage";
import DriversPage from "./pages/DriversPage";
import DriverDetailsPage from "./pages/DriverDetailsPage";
import AdminPhotoReportsPage from "./pages/AdminPhotoReportsPage";
import ProfilePhotosPage from "./pages/ProfilePhotosPage";
import ProfilePhotoViewerPage from "./pages/ProfilePhotoViewerPage";
import ProfilePhotoSettingsPage from "./pages/ProfilePhotoSettingsPage";
import ChatPage from "./pages/ChatPage";
import ChatPrivacyPage from "./pages/ChatPrivacyPage";
import AdminChatReportsPage from "./pages/AdminChatReportsPage";
import AdminRoleReviewPage from "./pages/AdminRoleReviewPage";
import AdminInboxPage from "./pages/AdminInboxPage";
import SuperAdminRoute from "./routes/SuperAdminRoute";
import AdminRoute from "./routes/AdminRoute";
import { useAuth } from "./context/authContext";
import { openDirectChat } from "./services/chatService";

function LoginContinuation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const params = new URLSearchParams(location.search);
  const requestedPath = params.get("next") ?? "";
  const next = requestedPath.startsWith("/") && !requestedPath.startsWith("//")
    && !requestedPath.startsWith("/login") ? requestedPath : "/dashboard";
  const recipientId = Number(params.get("chatUser"));
  const hasChatUser = params.has("chatUser");
  const listingId = Number(params.get("listing"));

  useEffect(() => {
    if (!hasChatUser || !Number.isSafeInteger(recipientId) || recipientId < 1) {
      navigate(next, { replace: true });
      return;
    }
    let active = true;
    void openDirectChat(recipientId).then((conversation) => {
      if (active) navigate(`/chats/${conversation.id}${Number.isSafeInteger(listingId) && listingId > 0
        ? `?listing=${listingId}` : ""}`, { replace: true });
    }).catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : "Could not open chat");
    });
    return () => { active = false; };
  }, [navigate, next, recipientId, listingId, hasChatUser]);

  return <section className="du-page">
    <p className={error ? "du-error" : "du-sand-text"}>{error || "Opening your conversation..."}</p>
    {error && <button className="du-button du-button-small du-button-back" type="button"
      onClick={() => navigate(next, { replace: true })}>Back to details</button>}
  </section>;
}

function RequireSession() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  return isAuthenticated ? <DashboardLayout />
    : <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
}

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
                <LoginContinuation />
              ) : (
                <LoginPage />
              )
            }
          />

          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/privacy/chat" element={<ChatPrivacyPage />} />
          <Route element={<DashboardLayout />}>
            <Route path="/festivals" element={<FestivalsPage />} />
            <Route path="/festivals/:id" element={<FestivalDetailsPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/marketplace/:id" element={<MarketplaceDetailsPage />} />
          </Route>
          <Route
            element={<RequireSession />}
          >
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsersPage />
                </AdminRoute>
              }
            />
            <Route path="/admin/users/:id/admin-access" element={<SuperAdminRoute><AdminRoleReviewPage /></SuperAdminRoute>} />
            <Route path="/admin/inbox" element={<AdminRoute><AdminInboxPage /></AdminRoute>} />
            <Route
              path="/admin/photo-reports"
              element={
                <AdminRoute>
                  <AdminPhotoReportsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/chat-reports"
              element={
                <AdminRoute>
                  <AdminChatReportsPage />
                </AdminRoute>
              }
            />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/drivers" element={<DriversPage />} />
            <Route path="/drivers/:id" element={<DriverDetailsPage />} />
            <Route path="/chats" element={<ChatPage />} />
            <Route path="/chats/:conversationId" element={<ChatPage />} />
            <Route path="/profile/photos" element={<ProfilePhotosPage />} />
            <Route
              path="/profile/photos/:photoId"
              element={<ProfilePhotoViewerPage />}
            />
            <Route
              path="/profile/photos/:photoId/settings"
              element={<ProfilePhotoSettingsPage />}
            />
            <Route path="/cars/:id/edit" element={<EditCarPage />} />
            <Route path="/cars/:id/gallery" element={<CarGalleryPage />} />
            <Route path="/cars/:id" element={<CarDetailsPage />} />
            <Route path="/cars" element={<MyCarsPage />} />
            <Route path="/cars/new" element={<AddCarPage />} />
            <Route path="/cars/:carId/sell" element={<MarketplaceEditorPage />} />
            <Route path="/marketplace/:listingId/edit" element={<MarketplaceEditorPage />} />
            <Route path="/races" element={<RacesPage />} />
            <Route
              path="/races/new"
              element={
                <AdminRoute>
                  <AddRacePage />
                </AdminRoute>
              }
            />
            <Route path="/races/:id" element={<RaceDetailsPage />} />
            <Route
              path="/races/:id/edit"
              element={
                <AdminRoute>
                  <EditRacePage />
                </AdminRoute>
              }
            />
            <Route path="/vip" element={<VipClubPage />} />
            <Route path="/activity" element={<DesertLivePage />} />
            <Route path="/activity/my" element={<DesertLivePage scope="MY" />} />
            <Route path="/activity/new" element={<DesertLiveEditorPage />} />
            <Route
              path="/activity/admin/:id/edit"
              element={
                <AdminRoute>
                  <DesertLiveEditorPage editScope="ADMIN" />
                </AdminRoute>
              }
            />
            <Route
              path="/activity/my/:id/edit"
              element={<DesertLiveEditorPage editScope="MY" />}
            />
            <Route
              path="/activity/my/:id"
              element={<DesertLiveDetailsPage itemScope="MY" />}
            />
            <Route path="/activity/:id" element={<DesertLiveDetailsPage />} />
          </Route>
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
