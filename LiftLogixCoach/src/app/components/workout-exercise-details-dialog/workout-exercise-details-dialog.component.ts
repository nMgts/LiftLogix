import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'app-workout-exercise-details-dialog',
  templateUrl: './workout-exercise-details-dialog.component.html',
  styleUrl: './workout-exercise-details-dialog.component.scss'
})
export class WorkoutExerciseDetailsDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<WorkoutExerciseDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public exercise: any
  ) {}

  formatRepetitions(exercise: any): string {
    if (exercise.repetitionsFrom !== null && exercise.repetitionsTo !== null) {
      return exercise.repetitionsFrom === exercise.repetitionsTo ? `${exercise.repetitionsFrom}` : `${exercise.repetitionsFrom} - ${exercise.repetitionsTo}`;
    } else if (exercise.repetitionsFrom === null && exercise.repetitionsTo !== null) {
      return exercise.repetitionsTo;
    } else if (exercise.repetitionsFrom !== null && exercise.repetitionsTo === null) {
      return exercise.repetitionsFrom;
    } else {
      return '';
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
