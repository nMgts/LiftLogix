import { WorkoutExercise } from "./WorkoutExercise";
import { WorkoutDate } from "./WorkoutDate";

export interface Workout {
  id: number;
  name: string;
  workoutExercises: WorkoutExercise[];
  days: number[];
  dates: WorkoutDate[];
}
