import API_BASE_URL from "./api";

export type RegisterUserRequest = {
  name: string;
  age: number;
  email: string;
  licenseCategory: string;
  password: string;
};

export async function registerUser(request: RegisterUserRequest) {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to create account");
  }

  return response.json();
}
