import API_BASE_URL from "./api";
import type { RaceCar } from "../types/raceCar";

export async function getAllRaceCars(): Promise<RaceCar[]> {
  const response = await fetch(`${API_BASE_URL}/race-cars`);

  if (!response.ok) {
    throw new Error("Failed to load race cars");
  }

  return response.json();
}

export async function getMyRaceCars(): Promise<RaceCar[]> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/race-cars/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load your race cars");
  }

  return response.json();
}

export async function createMyRaceCar(raceCar: {
  name: string;
  brand: string;
  horsePower: number;
  imageUrl: string;
}) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/race-cars/my`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(raceCar),
  });

  if (!response.ok) {
    throw new Error("Failed to create race car");
  }

  return response.json();
}
