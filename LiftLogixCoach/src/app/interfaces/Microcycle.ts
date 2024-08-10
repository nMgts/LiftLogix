import { Workout } from "./Workout";

export interface Microcycle {
  length: number;
  workouts: Workout[];
}
