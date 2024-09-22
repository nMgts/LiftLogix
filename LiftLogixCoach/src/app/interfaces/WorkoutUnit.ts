import { WorkoutExercise } from "./WorkoutExercise";

export interface WorkoutUnit {
  id: number;
  name: string;
  workoutExercises: WorkoutExercise[];
  date: string;
  individual: boolean;
  duration: number;
  microcycleDay: number;
}
