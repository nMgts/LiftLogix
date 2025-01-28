import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Report } from "../../interfaces/Report";
import { ReportService } from "../../services/report.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { PersonalPlanService } from "../../services/personal-plan.service";
import { PersonalPlan } from "../../interfaces/PersonalPlan";

@Component({
  selector: 'app-report-details-dialog',
  templateUrl: './report-details-dialog.component.html',
  styleUrl: './report-details-dialog.component.scss'
})
export class ReportDetailsDialogComponent {
  isEditing: boolean = false;
  editedCoachReport: string = '';
  isWorkoutDone: boolean = false;
  isWorkoutNotDone: boolean = false;

  selectedPlan: PersonalPlan | null = null;
  selectedWorkoutId: number = 0;

  constructor(
    public dialogRef: MatDialogRef<ReportDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Report,
    private reportService: ReportService,
    private personalPlanService: PersonalPlanService,
    private snackBar: MatSnackBar
  ) {
    this.editedCoachReport = data.coachReport || '';
    this.isWorkoutDone = data.isWorkoutDone || false;
    this.isWorkoutNotDone = !data.isWorkoutDone || false;
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  onStatusChange(isDone: boolean) {
    if (isDone) {
      this.isWorkoutDone = true;
      this.isWorkoutNotDone = false;
    } else {
      this.isWorkoutDone = false;
      this.isWorkoutNotDone = true;
    }
  }

  saveChanges() {
    const updatedData = {
      ...this.data,
      coachReport: this.editedCoachReport,
      isWorkoutDone: this.isWorkoutDone,
      coachReportDate: new Date(),
    };

    this.updateWorkout(updatedData);
    this.toggleEdit();
  }

  updateWorkout(updatedData: any) {
    const token = localStorage.getItem('token') || '';
    this.reportService.updateReport(updatedData, token).subscribe(() => {
      this.openSnackBar('Raport został zaktualizowany');
      this.onClose();
    }, error => {
      this.openSnackBar('Błąd, nieudało się zaktualizować raportu');
    });
  }

  viewWorkout(workoutId: number) {
    this.selectedWorkoutId = workoutId;

    const token = localStorage.getItem('token') || '';
    this.personalPlanService.getPersonalPlanByWorkout(workoutId, token).subscribe(
      (plan) => {
        this.selectedPlan = plan;
      },
      () => {
        this.openSnackBar('Nie udało się wczytać planu');
      }
    )
  }

  closeWorkoutView() {
    this.selectedWorkoutId = 0;
    this.selectedPlan = null;
  }

  private openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
