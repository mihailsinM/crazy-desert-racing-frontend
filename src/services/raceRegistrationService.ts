import API_BASE_URL from "./api";
import { authenticatedFetch } from "./authService";

export async function registerMyCarForRace(data: {
  raceCarId: number;
  raceId: number;
}) {
  const response = await authenticatedFetch(`${API_BASE_URL}/registrations/my`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to register for race");
  }

  return response.json();
}

export type RaceParticipant = {
  registrationId: number;
  userId: number;
  userName: string;
  raceCarId: number;
  carName: string;
  carBrand: string;
};

export async function getRaceParticipants(
  raceId: number,
): Promise<RaceParticipant[]> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/registrations/race/${raceId}/participants`,
  );

  if (!response.ok) {
    throw new Error("Failed to load race participants");
  }

  return response.json();
}
