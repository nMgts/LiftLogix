import { Client } from "./Client";

export interface SchedulerItem {
  id: number;
  workoutId: number;
  workoutName: string;
  startDate: string;
  endDate: string;
  client: Client;
}
