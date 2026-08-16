import { useCallback, useEffect, useMemo, useState } from "react";

import {
  hasToken,
  removeToken,
  subscribeToAuthChanges,
} from "../services/authService";
import { getCurrentUser } from "../services/userService";
import type { UserResponse } from "../types/user";
import { AuthContext } from "./authContext";

type AuthProviderProps = {
  children: React.ReactNode;
};

async function loadAuthenticatedUser(): Promise<UserResponse | null> {
  if (!hasToken()) {
    return null;
  }

  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUserState] = useState<UserResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(hasToken());
  const [sessionChecked, setSessionChecked] = useState(!hasToken());

  const refreshCurrentUser = useCallback(async () => {
    const user = await loadAuthenticatedUser();

    setCurrentUserState(user);
    setIsAuthenticated(user !== null);
    setSessionChecked(true);

    return user;
  }, []);

  useEffect(() => {
    let active = true;

    function synchronizeAuthState() {
      if (!hasToken()) {
        setCurrentUserState(null);
        setIsAuthenticated(false);
        setSessionChecked(true);
        return;
      }

      setIsAuthenticated(true);
      setSessionChecked(false);
      void refreshCurrentUser();
    }

    const unsubscribe = subscribeToAuthChanges(synchronizeAuthState);

    if (hasToken()) {
      void loadAuthenticatedUser().then((user) => {
        if (!active) {
          return;
        }

        setCurrentUserState(user);
        setIsAuthenticated(user !== null);
        setSessionChecked(true);
      });
    }

    return () => {
      active = false;
      unsubscribe();
    };
  }, [refreshCurrentUser]);

  const setCurrentUser = useCallback((user: UserResponse) => {
    setCurrentUserState(user);
  }, []);

  const logout = useCallback(() => {
    removeToken();
  }, []);

  const contextValue = useMemo(
    () => ({
      currentUser,
      isAuthenticated,
      sessionChecked,
      refreshCurrentUser,
      setCurrentUser,
      logout,
    }),
    [
      currentUser,
      isAuthenticated,
      sessionChecked,
      refreshCurrentUser,
      setCurrentUser,
      logout,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
