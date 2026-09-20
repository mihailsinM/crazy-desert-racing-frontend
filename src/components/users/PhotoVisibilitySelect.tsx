import type { UserPhotoVisibility } from "../../types/driver";
import DesertLiveMenuFilter from "../desert-live/DesertLiveMenuFilter";

const visibilityOptions = [
  { value: "PRIVATE", label: "Private", icon: "🔒" },
  { value: "MEMBERS_ONLY", label: "Club Members", icon: "👥" },
  { value: "PUBLIC", label: "Public Profile", icon: "🌍" },
] as const;

type PhotoVisibilitySelectProps = {
  value: UserPhotoVisibility;
  onChange: (value: UserPhotoVisibility) => void;
};

function PhotoVisibilitySelect({ value, onChange }: PhotoVisibilitySelectProps) {
  return (
    <DesertLiveMenuFilter
      buttonLabel="Visibility"
      menuLabel="Who can see this photo?"
      value={value}
      options={visibilityOptions}
      onChange={onChange}
      variant="SELECT"
    />
  );
}

export default PhotoVisibilitySelect;
