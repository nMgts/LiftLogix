export interface WorkoutExercise {
  exerciseId: number;
  exerciseName: string;
  series: number | null;
  repetitionsFrom: number | null;
  repetitionsTo: number | null;
  weight: number | null;
  percentage: number | null;
  tempo: string;
  rpe: number | null;
  breakTime: {
    value: number | null;
    unit: string;
  };
}
