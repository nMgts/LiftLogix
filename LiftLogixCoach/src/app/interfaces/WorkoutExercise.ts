import {Exercise} from "./Exercise";

export interface WorkoutExercise {
  exercise: Exercise;
  series: number | null;
  repetitionsFrom: number | null;
  repetitionsTo: number | null;
  weight: number | null;
  percentage: number | null;
  tempo: string;
  rpe: number | null;
  break: {
    value: number | null;
    unit: string;
  };
}
