import type { UserRole } from "../types/user";

export function hasAdminAccess(role: UserRole | null | undefined): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function formatUserRole(role: UserRole): string {
  if (role === "SUPER_ADMIN") {
    return "Super Administrator";
  }

  if (role === "ADMIN") {
    return "Administrator";
  }

  return "Crazy Desert Club Member";
}
