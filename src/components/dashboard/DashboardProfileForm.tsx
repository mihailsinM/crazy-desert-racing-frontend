import { useState } from "react";

import type {
  UserProfileUpdateRequest,
  UserResponse,
} from "../../types/user";

type DashboardProfileFormProps = {
  user: UserResponse;
  isSaving: boolean;
  onSave: (request: UserProfileUpdateRequest) => Promise<void>;
  onCancel: () => void;
};

type ProfileFormState = Omit<UserProfileUpdateRequest, "age"> & {
  age: string;
};

function createProfileForm(user: UserResponse): ProfileFormState {
  return {
    name: user.name,
    age: String(user.age),
    email: user.email,
    licenseCategory: user.licenseCategory,
  };
}

function DashboardProfileForm({
  user,
  isSaving,
  onSave,
  onCancel,
}: DashboardProfileFormProps) {
  const [profileForm, setProfileForm] = useState(() =>
    createProfileForm(user),
  );

  function updateProfileField<Key extends keyof ProfileFormState>(
    field: Key,
    value: ProfileFormState[Key],
  ) {
    setProfileForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSave({
      name: profileForm.name.trim(),
      age: Number(profileForm.age),
      email: profileForm.email.trim(),
      licenseCategory: profileForm.licenseCategory.trim(),
    });
  }

  return (
    <form className="du-form" onSubmit={handleSubmit}>
      <label className="du-field">
        <span className="du-field-label">Name</span>
        <input
          className="du-input"
          type="text"
          value={profileForm.name}
          maxLength={80}
          required
          onChange={(event) =>
            updateProfileField("name", event.target.value)
          }
        />
      </label>

      <label className="du-field">
        <span className="du-field-label">Age</span>
        <input
          className="du-input"
          type="number"
          value={profileForm.age}
          min={1}
          max={120}
          required
          onChange={(event) => updateProfileField("age", event.target.value)}
        />
      </label>

      <label className="du-field">
        <span className="du-field-label">Email</span>
        <input
          className="du-input"
          type="email"
          value={profileForm.email}
          maxLength={160}
          required
          onChange={(event) =>
            updateProfileField("email", event.target.value)
          }
        />
      </label>

      <label className="du-field">
        <span className="du-field-label">License category</span>
        <input
          className="du-input"
          type="text"
          value={profileForm.licenseCategory}
          maxLength={50}
          required
          onChange={(event) =>
            updateProfileField("licenseCategory", event.target.value)
          }
        />
      </label>

      <p className="du-caption">
        Changing the license category requires administrator verification
        again.
      </p>

      <div className="du-inline du-inline-sm du-inline-wrap du-inline-mobile-stack">
        <button
          className="du-button du-button-primary du-button-small"
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>

        <button
          className="du-button du-button-small"
          type="button"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default DashboardProfileForm;
