import API_BASE_URL from "./api";

export async function registerMyCarForRace(data: {
  raceCarId: number;
  raceId: number;
}) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/registrations/my`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to register for race");
  }

  return response.json();
}