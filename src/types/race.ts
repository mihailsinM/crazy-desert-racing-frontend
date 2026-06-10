export type Race = {
  id: number;
  name: string;
  location: string;
  startDate: string;
  maxParticipants: number;

  status: string;
  adminMessage: string | null;
};
