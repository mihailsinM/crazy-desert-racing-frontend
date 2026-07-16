import type { DashboardActivityItem } from "../DashboardActivity";
import type { DashboardHubItem } from "../DashboardHub";

export type DashboardHeroStat = {
  label: string;
  value: string;
};

export type DashboardConfig = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    stats: DashboardHeroStat[];
  };

  profile: {
    title: string;
  };

  hub: {
    title: string;
    items: DashboardHubItem[];
    addPath?: string;
    viewAllPath?: string;
  };

  activity: {
    title: string;
    items: DashboardActivityItem[];
    viewAllPath: string;
  };
};
