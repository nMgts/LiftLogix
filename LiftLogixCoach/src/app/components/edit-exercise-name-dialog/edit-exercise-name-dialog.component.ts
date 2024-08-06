import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-edit-exercise-name-dialog',
  templateUrl: './edit-exercise-name-dialog.component.html',
  styleUrl: './edit-exercise-name-dialog.component.scss'
})
export class EditExerciseNameDialogComponent {
  exerciseName: string = '';
  constructor(
    public dialogRef: MatDialogRef<EditExerciseNameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string },
    private snackBar: MatSnackBar
  ) {
    this.exerciseName = data.name;
  }

  onConfirm(): void {
    if (this.exerciseName.trim()) {
      this.dialogRef.close(this.exerciseName);
    } else {
      this.openSnackBar("Musisz podać nazwę")
    }
  }

  onCancel(): void {
    this.dialogRef.close(this.data.name);
  }

  private openSnackBar(message: string): void {
    this.snackBar.open(message, 'Zamknij', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }
}
