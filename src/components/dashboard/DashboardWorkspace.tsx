import DashboardHub from "./DashboardHub";
import DashboardProfile from "./DashboardProfile";

import type { DashboardHubItem } from "./DashboardHub";

export type DashboardWorkspaceView = "HUB" | "PROFILE";

type DashboardWorkspaceProps = {
  activeView: DashboardWorkspaceView;
  profileTitle: string;
  hubTitle: string;
  hubItems: DashboardHubItem[];
  addPath?: string;
  viewAllPath?: string;
  onCloseProfile: () => void;
};

function DashboardWorkspace({
  activeView,
  profileTitle,
  hubTitle,
  hubItems,
  addPath,
  viewAllPath,
  onCloseProfile,
}: DashboardWorkspaceProps) {
  if (activeView === "PROFILE") {
    return (
      <DashboardProfile
        title={profileTitle}
        onBack={onCloseProfile}
      />
    );
  }

  return (
    <DashboardHub
      title={hubTitle}
      items={hubItems}
      addPath={addPath}
      viewAllPath={viewAllPath}
    />
  );
}

export default DashboardWorkspace;
