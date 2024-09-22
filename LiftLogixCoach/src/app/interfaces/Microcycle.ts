import { Workout } from "./Workout";
import {WorkoutUnit} from "./WorkoutUnit";

export interface Microcycle {
  length: number;
  workouts: Workout[];
  workoutUnits: WorkoutUnit[];
}
