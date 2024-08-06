import { Component } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-add-workout-dialog',
  templateUrl: './add-workout-dialog.component.html',
  styleUrl: './add-workout-dialog.component.scss'
})
export class AddWorkoutDialogComponent {
  workoutName: string = '';

  constructor(public dialogRef: MatDialogRef<AddWorkoutDialogComponent>, private snackBar: MatSnackBar) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.workoutName.trim()) {
      this.dialogRef.close(this.workoutName);
    } else {
      this.openSnackBar("Musisz podać nazwę");
    }
  }

  private openSnackBar(message: string): void {
    this.snackBar.open(message, 'Zamknij', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }
}
