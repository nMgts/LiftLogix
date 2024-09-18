import { WorkoutExercise } from "./WorkoutExercise";

export interface Workout {
  id: number;
  name: string;
  workoutExercises: WorkoutExercise[];
  days: number[];
  individual: boolean;
  dates: string[];
}
