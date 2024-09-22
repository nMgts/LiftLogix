import { WorkoutExercise } from "./WorkoutExercise";

export interface Workout {
  id: number;
  name: string;
  workoutExercises: WorkoutExercise[];
  days: number[];
}
