import { useState } from "react";

import DashboardActivity from "../../components/dashboard/DashboardActivity";
import DashboardHero from "../../components/dashboard/DashboardHero";
import DashboardShell from "../../components/dashboard/DashboardShell";
import DashboardWorkspace, {
  type DashboardWorkspaceView,
} from "../../components/dashboard/DashboardWorkspace";
import { createAdminDashboardConfig } from "../../components/dashboard/config/adminDashboardConfig";
import { useAuth } from "../../context/authContext";

function AdminDashboard() {
  const { currentUser } = useAuth();

  const [workspaceView, setWorkspaceView] =
    useState<DashboardWorkspaceView>("HUB");

  if (!currentUser) {
    return null;
  }

  const config = createAdminDashboardConfig(currentUser);

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
