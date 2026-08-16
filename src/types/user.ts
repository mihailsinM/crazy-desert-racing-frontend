export interface UserResponse {
  id: number;
  name: string;
  email: string;
  age: number;
  licenseCategory: string;
  licenseVerified: boolean;
  role: "USER" | "ADMIN";
  avatarUrl: string | null;
}

export interface UserProfileUpdateRequest {
  name: string;
  age: number;
  email: string;
  licenseCategory: string;
}
