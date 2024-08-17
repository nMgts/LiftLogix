import { User } from "./User";
import { Mesocycle } from "./Mesocycle";

export interface Plan {
  id: number;
  name: string;
  author: User;
  isPublic: boolean;
  mesocycles: Mesocycle[];
}
