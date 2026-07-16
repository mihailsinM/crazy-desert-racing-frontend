import type { UserResponse } from "../../../types/user";
import type { DashboardConfig } from "./dashboardConfig.types";

export function createAdminDashboardConfig(
  user: UserResponse,
): DashboardConfig {
  return {
    hero: {
      eyebrow: "🏜 Crazy Desert Racing Admin",
      title: `Welcome back, ${user.name}`,
      description:
        "Manage users, races, vehicles and the Crazy Desert Racing community.",
      stats: [
        {
          label: "Role",
          value: user.role,
        },
        {
          label: "Admin Status",
          value: "Active",
        },
      ],
    },

    profile: {
      title: "Admin Profile",
    },

    hub: {
      title: "⚡ Admin Hub",
      addPath: "/admin/hub/new",
      viewAllPath: "/admin/hub",
      items: [
        {
          title: "👥 Users Management",
          text: "View users, verify licenses and manage roles.",
          path: "/admin/users",
        },
        {
          title: "🏁 Create Race",
          text: "Create new race events for the club.",
          path: "/add-race",
        },
        {
          title: "🏁 Upcoming Races",
          text: "Open and manage upcoming race events.",
          path: "/races",
        },
        {
          title: "🏎 My Cars",
          text: "Add and manage your desert racing vehicles.",
          path: "/cars",
        },
        {
          title: "⭐ VIP Club",
          text: "Preview premium festival and racing experiences.",
          path: "/vip",
        },
        {
          title: "🛒 Marketplace",
          text: "Browse racing cars, parts and desert offers.",
          path: "/marketplace",
        },
      ],
    },

    activity: {
      title: "🔥 Desert Live",
      viewAllPath: "/activity",
      items: [
        {
          id: "admin-race-1",
          type: "RACE",
          title: "🏁 Negev Desert Challenge",
          text: "Registration is now open for the next desert race.",
          path: "/races",
        },
        {
          id: "admin-festival-1",
          type: "FESTIVAL",
          title: "🎵 Desert Night Festival",
          text: "A new festival event has been added.",
          path: "/festivals",
        },
        {
          id: "admin-marketplace-1",
          type: "MARKETPLACE",
          title: "🛒 New vehicle listed",
          text: "A member published a new racing vehicle for sale.",
          path: "/marketplace",
        },
        {
          id: "admin-marketplace-2",
          type: "MARKETPLACE",
          title: "💰 Marketplace price updated",
          text: "The price of a listed vehicle has changed.",
          path: "/marketplace",
        },
      ],
    },
  };
}
