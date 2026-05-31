import API_BASE_URL from "./api";
import type { RaceCar } from "../types/raceCar";

export async function getAllRaceCars(): Promise<RaceCar[]> {
  const response = await fetch(`${API_BASE_URL}/race-cars`);

  if (!response.ok) {
    throw new Error("Failed to load race cars");
  }

  return response.json();
}