import API_BASE_URL from "./api";
import { authenticatedFetch } from "./authService";
import type { RaceCar } from "../types/raceCar";

export async function getAllRaceCars(): Promise<RaceCar[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}/race-cars`);

  if (!response.ok) {
    throw new Error("Failed to load race cars");
  }

  return response.json();
}

export async function getMyRaceCars(): Promise<RaceCar[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}/race-cars/my`);

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
  imagePosition: string;
}) {
  const response = await authenticatedFetch(`${API_BASE_URL}/race-cars/my`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(raceCar),
  });

  if (!response.ok) {
    throw new Error("Failed to create race car");
  }

  return response.json();
}

export async function getRaceCarById(id: number): Promise<RaceCar> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/race-cars/${id}`,
  );

  if (!response.ok) {
    throw new Error("Failed to load race car details");
  }

  return response.json();
}

export async function updateRaceCar(
  id: number,
  raceCar: {
    name: string;
    brand: string;
    horsePower: number;
    imageUrl: string;
    imagePosition: string;
  },
): Promise<RaceCar> {
  const response = await authenticatedFetch(`${API_BASE_URL}/race-cars/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(raceCar),
  });

  if (!response.ok) {
    throw new Error("Failed to update race car");
  }

  return response.json();
}

export async function deleteRaceCar(id: number): Promise<void> {
  const response = await authenticatedFetch(`${API_BASE_URL}/race-cars/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete race car");
  }
}
