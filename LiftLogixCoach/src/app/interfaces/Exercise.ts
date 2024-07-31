import {SafeUrl} from "@angular/platform-browser";

export interface Exercise {
  id: number;
  name: string;
  description: string;
  url: string;
  image: string;
  body_parts: string[];
}
