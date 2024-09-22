import { WorkoutUnit } from "./WorkoutUnit";

export interface Day {
  day: number;
  month: number;
  year: number;
  events: WorkoutUnit[];
}
