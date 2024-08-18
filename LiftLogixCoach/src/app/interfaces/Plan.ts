import { User } from "./User";
import { Mesocycle } from "./Mesocycle";

export interface Plan {
  id: number;
  name: string;
  author: User;
  public: boolean;
  mesocycles: Mesocycle[];
}
