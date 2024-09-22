import { Client } from "./Client";

export interface SchedulerItem {
  id: number;
  workoutUnitId: number;
  workoutUnitName: string;
  startDate: string;
  endDate: string;
  client: Client;
}
