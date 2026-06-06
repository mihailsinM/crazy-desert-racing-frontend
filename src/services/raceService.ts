import API_BASE_URL from "./api";
import type { Race } from "../types/race";

export async function getAllRaces(): Promise<Race[]> {
  const response = await fetch(`${API_BASE_URL}/races`);

  if (!response.ok) {
    throw new Error("Failed to load races");
  }

  return response.json();
}

export async function getRaceById(id: number): Promise<Race> {
  const response = await fetch(`${API_BASE_URL}/races/${id}`);

  if (!response.ok) {
    throw new Error("Failed to load race");
  }

  return response.json();
}

export type RaceCreateRequest = {
  name: string;
  location: string;
  startDate: string;
  maxParticipants: number;
};

export async function createRace(
  request: RaceCreateRequest
): Promise<Race> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/races`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to create race");
  }

  return response.json();
}