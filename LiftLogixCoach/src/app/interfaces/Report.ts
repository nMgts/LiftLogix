export interface Report {
  id: number,
  clientReport: string | null,
  clientReportDate: string | null,
  coachReport: string | null,
  coachReportDate: string | null,
  workoutUnitId: number,
  workoutUnitName: string,
  workoutUnitDate: string,
  clientFirstName: string,
  clientLastName: string,
  clientEmail: string
  isWorkoutDone: boolean | null;
}
