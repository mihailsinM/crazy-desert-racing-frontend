import { useState } from "react";

import type { PublicProfileUpdateRequest } from "../../types/driver";
import type { UserResponse } from "../../types/user";

type PublicProfileFormProps = {
  user: UserResponse;
  saving: boolean;
  onSave: (request: PublicProfileUpdateRequest) => Promise<void>;
  onCancel: () => void;
};

function PublicProfileForm({
  user,
  saving,
  onSave,
  onCancel,
}: PublicProfileFormProps) {
  const [bio, setBio] = useState(user.profileBio ?? "");
  const [location, setLocation] = useState(user.profileLocation ?? "");
  const [showCars, setShowCars] = useState(user.showCars);
  const [showRaceHistory, setShowRaceHistory] = useState(
    user.showRaceHistory,
  );
  const [showPhotos, setShowPhotos] = useState(user.showPhotos);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSave({
      bio: bio.trim() || null,
      location: location.trim() || null,
      showCars,
      showRaceHistory,
      showPhotos,
    });
  }

  return (
    <form className="du-form du-public-profile-form" onSubmit={handleSubmit}>
      <label className="du-field">
        <span className="du-field-label">Public bio</span>
        <textarea
          className="du-textarea"
          value={bio}
          maxLength={500}
          placeholder="Tell the club about your desert racing interests..."
          onChange={(event) => setBio(event.currentTarget.value)}
        />
      </label>

      <label className="du-field">
        <span className="du-field-label">Public location</span>
        <input
          className="du-input"
          value={location}
          maxLength={120}
          placeholder="Negev, Israel"
          onChange={(event) => setLocation(event.currentTarget.value)}
        />
      </label>

      <fieldset className="du-privacy-options">
        <legend className="du-field-label">What other drivers can see</legend>

        <label className="du-check-row">
          <input
            type="checkbox"
            checked={showCars}
            onChange={(event) => setShowCars(event.currentTarget.checked)}
          />
          <span>Show my cars</span>
        </label>
        <label className="du-check-row">
          <input
            type="checkbox"
            checked={showRaceHistory}
            onChange={(event) =>
              setShowRaceHistory(event.currentTarget.checked)
            }
          />
          <span>Show my race history</span>
        </label>
        <label className="du-check-row">
          <input
            type="checkbox"
            checked={showPhotos}
            onChange={(event) => setShowPhotos(event.currentTarget.checked)}
          />
          <span>Show my photo gallery</span>
        </label>
      </fieldset>

      <p className="du-caption">
        Your email, exact age, and license category are never shown in the
        public driver profile.
      </p>

      <div className="du-inline du-inline-sm du-inline-wrap">
        <button
          type="submit"
          className="du-button du-button-primary du-button-small"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Public Profile"}
        </button>
        <button
          type="button"
          className="du-button du-button-small"
          disabled={saving}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default PublicProfileForm;
