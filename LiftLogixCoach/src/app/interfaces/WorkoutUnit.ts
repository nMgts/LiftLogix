import { WorkoutExercise } from "./WorkoutExercise";
import { Report } from "./Report";

export interface WorkoutUnit {
  id: number;
  name: string;
  workoutExercises: WorkoutExercise[];
  date: string;
  individual: boolean;
  duration: number;
  microcycleDay: number;
  report?: Report | null;
}
