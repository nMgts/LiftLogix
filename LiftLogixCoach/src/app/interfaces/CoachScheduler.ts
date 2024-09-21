import { Coach } from "./Coach";
import { SchedulerItem } from "./SchedulerItem";

export interface CoachScheduler {
  id: number;
  coach: Coach;
  schedulerItems: SchedulerItem[];
}
