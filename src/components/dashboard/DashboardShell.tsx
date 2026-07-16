import type { ReactNode } from "react";

type DashboardShellProps = {
  children: ReactNode;
};

function DashboardShell({ children }: DashboardShellProps) {
  return <div>{children}</div>;
}

export default DashboardShell;