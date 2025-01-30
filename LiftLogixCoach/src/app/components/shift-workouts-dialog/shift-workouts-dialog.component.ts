import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { PersonalPlanService } from "../../services/personal-plan.service";
import { PersonalPlan } from "../../interfaces/PersonalPlan";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: 'app-shift-workouts-dialog',
  templateUrl: './shift-workouts-dialog.component.html',
  styleUrl: './shift-workouts-dialog.component.scss'
})
export class ShiftWorkoutsDialogComponent {
  shiftForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ShiftWorkoutsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { personalPlan: PersonalPlan },
    private personalPlanService: PersonalPlanService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.shiftForm = this.fb.group({
      startDate: ["", Validators.required],
      endDate: ["", Validators.required],
      shiftDays: ["", [Validators.required, Validators.min(1)]],
    });
  }

  shiftWorkouts() {
    if (this.shiftForm.valid) {
      const { startDate, endDate, shiftDays } = this.shiftForm.value;
      const token = localStorage.getItem("token") || "";

      this.personalPlanService
        .shiftWorkoutDates(
          {
            personalPlanDTO: this.data.personalPlan,
            startDate,
            endDate,
            shift: shiftDays,
          },
          token
        )
        .subscribe(() => {
          this.dialogRef.close(true);
        }, error => {
          if (error.status === 409) {
            this.openSnackBar('Konflikt: W podanym przedziale czasowym posiadasz już trening personalny lub klient ma zapisany inny trening');
          } else {
            this.openSnackBar('Błąd przy zmianie daty treningu');
          }
        });
    }
  }

  private openSnackBar(message: string): void {
    this.snackBar.open(message, 'Zamknij', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }
}
