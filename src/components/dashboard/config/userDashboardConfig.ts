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
      items: [
        {
          id: "user-race-1",
          type: "RACE",
          title: "🏁 Negev Desert Challenge",
          text: "Registration is open for the upcoming race.",
          path: "/races",
        },
        {
          id: "user-festival-1",
          type: "FESTIVAL",
          title: "🎵 Desert Night Festival",
          text: "Discover the next music and racing festival.",
          path: "/festivals",
        },
        {
          id: "user-marketplace-1",
          type: "MARKETPLACE",
          title: "🛒 New racing car listed",
          text: "A new vehicle is available in the Marketplace.",
          path: "/marketplace",
        },
        {
          id: "user-news-1",
          type: "NEWS",
          title: "🔥 Club update",
          text: "New Crazy Desert Racing features are coming soon.",
          path: "/activity",
        },
      ],
    },
  };
}
