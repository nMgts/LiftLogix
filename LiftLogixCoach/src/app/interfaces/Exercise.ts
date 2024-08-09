export interface Exercise {
  id: number;
  name: string;
  description: string;
  url: string;
  image: string;
  body_parts: string[];
  aliases: { id: number; alias: string; language: string }[];
}
