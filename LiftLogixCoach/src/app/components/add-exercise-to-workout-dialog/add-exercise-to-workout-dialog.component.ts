import { Component } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-add-exercise-to-workout-dialog',
  templateUrl: './add-exercise-to-workout-dialog.component.html',
  styleUrl: './add-exercise-to-workout-dialog.component.scss'
})
export class AddExerciseToWorkoutDialogComponent {
  exerciseName: string = '';

  constructor(public dialogRef: MatDialogRef<AddExerciseToWorkoutDialogComponent>, private snackBar: MatSnackBar) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.exerciseName.trim()) {
      this.dialogRef.close(this.exerciseName);
    } else {
      this.openSnackBar("Musisz podać nazwę")
    }
  }

  private openSnackBar(message: string): void {
    this.snackBar.open(message, 'Zamknij', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }
}
