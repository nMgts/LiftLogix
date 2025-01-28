export interface Report {
  id: number,
  clientReport: string,
  clientReportDate: string,
  coachReport: string,
  coachReportDate: string,
  workoutUnitId: number,
  workoutUnitName: string,
  workoutUnitDate: string,
  clientFirstName: string,
  clientLastName: string,
  clientEmail: string
  isWorkoutDone: boolean | null;
}
