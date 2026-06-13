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
  imagePosition: string;
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

export async function getRaceCarById(id: number): Promise<RaceCar> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/race-cars/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

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
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/race-cars/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(raceCar),
  });

  if (!response.ok) {
    throw new Error("Failed to update race car");
  }

  return response.json();
}
