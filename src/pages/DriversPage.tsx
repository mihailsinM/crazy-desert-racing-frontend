import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import raceBackground from "../assets/race.png";
import DetailsCard from "../components/details/DetailsCard";
import DesertLiveMenuFilter, {
  type DesertLiveFilterOption,
} from "../components/desert-live/DesertLiveMenuFilter";
import EntityListToolbar from "../components/lists/EntityListToolbar";
import AdaptiveCardList from "../components/lists/AdaptiveCardList";
import CatalogPage from "../components/lists/CatalogPage";
import UserAvatar from "../components/users/UserAvatar";
import { useAuth } from "../context/authContext";
import { getDrivers } from "../services/driverService";
import type { DriverSummary } from "../types/driver";

function formatTier(tier: DriverSummary["membershipTier"]): string {
  return tier.charAt(0) + tier.slice(1).toLowerCase();
}

type DriverMembershipFilter = DriverSummary["membershipTier"] | "ALL";
type DriverStatusFilter = "ALL" | "VERIFIED" | "PENDING";

const membershipOptions: readonly DesertLiveFilterOption<DriverMembershipFilter>[] = [
  { value: "ALL", label: "All memberships", icon: "✨" },
  { value: "STANDARD", label: "Standard", icon: "🏜" },
  { value: "SILVER", label: "Silver", icon: "◈" },
  { value: "GOLD", label: "Gold", icon: "★" },
  { value: "PLATINUM", label: "Platinum", icon: "◆" },
];

const driverStatusOptions: readonly DesertLiveFilterOption<DriverStatusFilter>[] = [
  { value: "ALL", label: "All statuses", icon: "◎" },
  { value: "VERIFIED", label: "Verified drivers", icon: "✓" },
  { value: "PENDING", label: "License pending", icon: "◷" },
];

function DriversPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [drivers, setDrivers] = useState<DriverSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [membership, setMembership] =
    useState<DriverMembershipFilter>("ALL");
  const [driverStatus, setDriverStatus] =
    useState<DriverStatusFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    void getDrivers()
      .then((loadedDrivers) => {
        if (active) {
          setDrivers(loadedDrivers);
        }
      })
      .catch((caughtError) => {
        if (active) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Failed to load drivers",
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredDrivers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return drivers.filter((driver) => {
      const matchesSearch =
        !search ||
        [driver.name, driver.role, driver.membershipTier].some((value) =>
          value.toLowerCase().includes(search),
        );
      const matchesMembership =
        membership === "ALL" || driver.membershipTier === membership;
      const matchesStatus =
        driverStatus === "ALL" ||
        (driverStatus === "VERIFIED" && driver.verifiedDriver) ||
        (driverStatus === "PENDING" && !driver.verifiedDriver);

      return matchesSearch && matchesMembership && matchesStatus;
    });
  }, [driverStatus, drivers, membership, searchTerm]);

  if (loading) {
    return <p className="du-sand-text">Loading club drivers...</p>;
  }

  if (error) {
    return <p className="du-error">{error}</p>;
  }

  return (
    <CatalogPage>
      <DetailsCard
        image={{ src: raceBackground, alt: "Desert race background" }}
        eyebrow="Club Members"
        title={<>👥 All Drivers</>}
        overlayClassName="du-scroll"
        topAligned
      >
        <EntityListToolbar
          searchValue={searchTerm}
          searchPlaceholder="Search drivers..."
          onSearchChange={setSearchTerm}
        >
          <DesertLiveMenuFilter
            buttonLabel="Filter"
            menuLabel="Membership"
            value={membership}
            options={membershipOptions}
            onChange={setMembership}
          />

          <DesertLiveMenuFilter
            buttonLabel="Status"
            menuLabel="Driver status"
            value={driverStatus}
            options={driverStatusOptions}
            onChange={setDriverStatus}
          />

          {currentUser?.role === "ADMIN" && (
            <button
              type="button"
              className="du-button du-button-small du-button-rect"
              onClick={() => navigate("/admin/users")}
            >
              All Users
            </button>
          )}

          <button
            type="button"
            className="du-button du-button-small du-button-rect du-button-back"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
        </EntityListToolbar>

        <AdaptiveCardList className="du-list-row-large">
          {filteredDrivers.length === 0 ? (
            <div className="du-row-panel">
              <div className="du-row-main">
                <span className="du-row-title">No drivers found</span>
                <span className="du-row-subtitle">
                  Try another name or membership status.
                </span>
              </div>
            </div>
          ) : (
            filteredDrivers.map((driver) => (
              <button
                key={driver.id}
                type="button"
                className="du-row-panel du-driver-row"
                onClick={() => navigate(`/drivers/${driver.id}`)}
              >
                <UserAvatar
                  name={driver.name}
                  avatarUrl={driver.avatarUrl}
                  imageFraming={driver.imageFraming}
                />

                <span className="du-row-main">
                  <span className="du-row-heading">
                    <span className="du-row-title">{driver.name}</span>
                    {driver.verifiedDriver && (
                      <span className="du-status du-status-small du-status-verified">
                        Verified Driver
                      </span>
                    )}
                    <span className="du-badge du-driver-tier">
                      {formatTier(driver.membershipTier)}
                    </span>
                  </span>

                  <span className="du-row-subtitle">
                    {driver.role === "ADMIN"
                      ? "Club Administrator"
                      : "Crazy Desert Club Member"}
                  </span>
                  <span className="du-row-subtitle">
                    {driver.carCount} cars · {driver.raceCount} races ·{" "}
                    {driver.photoCount} photos
                  </span>
                </span>

                <span className="du-button du-button-small du-button-rect">
                  View Profile
                </span>
              </button>
            ))
          )}
        </AdaptiveCardList>
      </DetailsCard>
    </CatalogPage>
  );
}

export default DriversPage;
