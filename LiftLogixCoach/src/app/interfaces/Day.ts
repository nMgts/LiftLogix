import { Workout } from "./Workout";

export interface Day {
  day: number;
  month: number;
  year: number;
  events: Workout[];
}
