import DashboardActivity from "../../components/dashboard/DashboardActivity";
import DashboardHero from "../../components/dashboard/DashboardHero";
import DashboardShell from "../../components/dashboard/DashboardShell";
import DashboardWorkspace, {
  type DashboardWorkspaceView,
} from "../../components/dashboard/DashboardWorkspace";
import { createAdminDashboardConfig } from "../../components/dashboard/config/adminDashboardConfig";
import { useAuth } from "../../context/authContext";

type AdminDashboardProps = {
  workspaceView: DashboardWorkspaceView;
  onWorkspaceViewChange: (view: DashboardWorkspaceView) => void;
};

function AdminDashboard({
  workspaceView,
  onWorkspaceViewChange,
}: AdminDashboardProps) {
  const { currentUser } = useAuth();

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
        onOpenProfile={() => onWorkspaceViewChange("PROFILE")}
      />

      <section
        className={`du-dashboard-grid${
          workspaceView === "PROFILE" ? " du-dashboard-grid-profile" : ""
        }`}
      >
        <DashboardWorkspace
          activeView={workspaceView}
          profileTitle={config.profile.title}
          hubTitle={config.hub.title}
          hubItems={config.hub.items}
          addPath={config.hub.addPath}
          viewAllPath={config.hub.viewAllPath}
          onCloseProfile={() => onWorkspaceViewChange("HUB")}
        />

        <DashboardActivity
          title={config.activity.title}
          viewAllPath={config.activity.viewAllPath}
          addPath={config.activity.addPath}
          visibleItemCount={workspaceView === "PROFILE" ? 4 : 3}
        />
      </section>
    </DashboardShell>
  );
}

export default AdminDashboard;
