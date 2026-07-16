import { useState } from "react";

import DashboardActivity from "../../components/dashboard/DashboardActivity";
import DashboardHero from "../../components/dashboard/DashboardHero";
import DashboardShell from "../../components/dashboard/DashboardShell";
import DashboardWorkspace, {
  type DashboardWorkspaceView,
} from "../../components/dashboard/DashboardWorkspace";
import { createAdminDashboardConfig } from "../../components/dashboard/config/adminDashboardConfig";

import type { UserResponse } from "../../types/user";

type AdminDashboardProps = {
  user: UserResponse;
};

function AdminDashboard({ user }: AdminDashboardProps) {
  const config = createAdminDashboardConfig(user);

  const [workspaceView, setWorkspaceView] =
    useState<DashboardWorkspaceView>("HUB");

  return (
    <DashboardShell>
      <DashboardHero
        eyebrow={config.hero.eyebrow}
        title={config.hero.title}
        description={config.hero.description}
        stats={config.hero.stats}
        onOpenProfile={() => setWorkspaceView("PROFILE")}
      />

      <section className="du-dashboard-grid">
        <DashboardWorkspace
          user={user}
          activeView={workspaceView}
          profileTitle={config.profile.title}
          hubTitle={config.hub.title}
          hubItems={config.hub.items}
          addPath={config.hub.addPath}
          viewAllPath={config.hub.viewAllPath}
          onCloseProfile={() => setWorkspaceView("HUB")}
        />

        <DashboardActivity
          title={config.activity.title}
          items={config.activity.items}
          viewAllPath={config.activity.viewAllPath}
        />
      </section>
    </DashboardShell>
  );
}

export default AdminDashboard;