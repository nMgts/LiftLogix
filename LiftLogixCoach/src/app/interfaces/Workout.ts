import { WorkoutExercise } from "./WorkoutExercise";

export interface Workout {
  name: string;
  workoutExercises: WorkoutExercise[];
  days: number[];
}
