import { Component, ElementRef, Inject, Renderer2, ViewChild } from '@angular/core';
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
  @ViewChild('elem', { static: true }) elem!: ElementRef;
  scrollTimeout: any;

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
    private snackBar: MatSnackBar,
    private renderer: Renderer2
  ) {
    this.editedCoachReport = data.coachReport || '';
    this.isWorkoutDone = data.isWorkoutDone || false;
    this.isWorkoutNotDone = data.isWorkoutDone == false || false;
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  changeDone() {
    this.isWorkoutDone = false;
  }

  changeNotDone() {
    this.isWorkoutNotDone = false;
  }

  saveChanges() {
    let done: boolean | null = this.isWorkoutDone;
    if (!this.isWorkoutDone && !this.isWorkoutNotDone) {
      done = null;
    }

    let date;
    if (this.editedCoachReport != this.data.coachReport) {
      date = new Date();
      date.setHours(date.getHours() + 1);
    } else {
      date = this.data.coachReportDate;
    }

    const updatedData = {
      ...this.data,
      coachReport: this.editedCoachReport,
      isWorkoutDone: done,
      coachReportDate: date,
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

  onScroll(event: Event): void {
    const target = event.target as HTMLElement;

    if (target) {
      this.renderer.addClass(document.body, 'show-scrollbar');

      clearTimeout(this.scrollTimeout);

      this.scrollTimeout = setTimeout(() => {
        this.renderer.removeClass(document.body, 'show-scrollbar');
      }, 3000);
    }
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
