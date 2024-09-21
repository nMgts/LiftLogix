export interface Exercise {
  id: number;
  name: string;
  description: string;
  url: string;
  image: string;
  body_parts: string[];
  exercise_type: string;
  difficulty_factor: number;
  certificated: boolean;
  aliases: { id: number; alias: string; language: string }[];
}
