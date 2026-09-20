import { createContext, useContext } from "react";

import type { UserResponse } from "../types/user";

export type LogoutDestination = "/" | "/login";

export type AuthContextValue = {
  currentUser: UserResponse | null;
  isAuthenticated: boolean;
  sessionChecked: boolean;
  refreshCurrentUser: () => Promise<UserResponse | null>;
  setCurrentUser: (user: UserResponse) => void;
  logout: (destination?: LogoutDestination) => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
