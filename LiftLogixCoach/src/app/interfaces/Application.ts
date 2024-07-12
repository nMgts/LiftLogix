import {Client} from "./Client";

export interface Application {
  id: number;
  client: Client;
  description: string;
  status: string;
  submitted_date: string;
}
