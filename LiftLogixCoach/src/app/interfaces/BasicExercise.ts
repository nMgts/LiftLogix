export interface BasicExercise {
  id: number;
  name: string;
  body_parts: string[];
  exercise_type: string;
  certificated: boolean;
  aliases: { id: number; alias: string; language: string }[];
}
