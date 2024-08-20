export interface BasicExercise {
  id: number;
  name: string;
  body_parts: string[];
  aliases: { id: number; alias: string; language: string }[];
}
