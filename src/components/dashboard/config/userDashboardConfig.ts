import type { UserResponse } from "../../../types/user";
import type { DashboardConfig } from "./dashboardConfig.types";

export function createUserDashboardConfig(user: UserResponse): DashboardConfig {
  return {
    hero: {
      eyebrow: "🏜 Crazy Desert Racing Club",
      title: `Welcome back, ${user.name}`,
      description:
        "Your racing profile, upcoming events, cars and VIP access are ready.",
      stats: [
        {
          label: "Next Event",
          value: "Negev Desert Challenge",
        },
        {
          label: "VIP Status",
          value: "Standard Member",
        },
      ],
    },

    profile: {
      title: "Driver Profile",
    },

    hub: {
      title: "⚡ Driver Hub",
      viewAllPath: "/hub",
      items: [
        {
          title: "🏁 Upcoming Races",
          text: "Open upcoming desert race events.",
          path: "/races",
        },
        {
          title: "🏎 My Cars",
          text: "Add and manage your desert racing vehicles.",
          path: "/cars",
        },
        {
          title: "⭐ VIP Club",
          text: "Unlock premium festival and racing experiences.",
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
    },
  };
}
