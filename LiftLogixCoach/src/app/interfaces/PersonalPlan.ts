import { Mesocycle } from "./Mesocycle";
import { Client } from "./Client";

export interface PersonalPlan {
  id: number;
  name: string;
  mesocycles: Mesocycle[];
  client: Client;
  startDate: string;
  length: number;
  active: boolean;
}
