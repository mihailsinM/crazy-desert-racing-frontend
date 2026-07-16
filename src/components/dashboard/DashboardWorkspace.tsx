import DashboardHub from "./DashboardHub";
import DashboardProfile from "./DashboardProfile";

import type { DashboardHubItem } from "./DashboardHub";
import type { UserResponse } from "../../types/user";

export type DashboardWorkspaceView = "HUB" | "PROFILE";

type DashboardWorkspaceProps = {
  user: UserResponse;
  activeView: DashboardWorkspaceView;
  profileTitle: string;
  hubTitle: string;
  hubItems: DashboardHubItem[];
  addPath?: string;
  viewAllPath?: string;
  onCloseProfile: () => void;
};

function DashboardWorkspace({
  user,
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
        user={user}
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