import API_BASE_URL from "./api";
import type { Race } from "../types/race";

export async function getAllRaces(): Promise<Race[]> {
  const response = await fetch(`${API_BASE_URL}/races`);

  if (!response.ok) {
    throw new Error("Failed to load races");
  }

  return response.json();
}