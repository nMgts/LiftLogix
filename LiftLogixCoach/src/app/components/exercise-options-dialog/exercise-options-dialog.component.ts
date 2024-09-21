import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'app-exercise-options-dialog',
  templateUrl: './exercise-options-dialog.component.html',
  styleUrls: ['./exercise-options-dialog.component.scss']
})
export class ExerciseOptionsDialogComponent {
  showAdvancedOptions: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ExerciseOptionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.showAdvancedOptions = data.showAdvancedOptions || false;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.validateExercise(this.data.exercise);

    this.dialogRef.close({
      exercise: this.data.exercise,
      showAdvancedOptions: this.showAdvancedOptions
    });
  }

  validateExercise(exercise: any): void {
    if (exercise.series !== null && exercise.series < 1) {
      exercise.series = null;
    }

    // Validate repetitions
    if (exercise.repetitionsFrom !== null && exercise.repetitionsFrom < 1) {
      exercise.repetitionsFrom = null;
    }
    if (exercise.repetitionsTo !== null && exercise.repetitionsTo < 1) {
      exercise.repetitionsTo = null;
    }
    if (exercise.repetitionsTo !== null && exercise.repetitionsFrom !== null) {
      if (exercise.repetitionsFrom > exercise.repetitionsTo) {
        [exercise.repetitionsFrom, exercise.repetitionsTo] = [exercise.repetitionsTo, exercise.repetitionsFrom];
      }
    }

    // Validate weight
    if (exercise.weight !== null && exercise.weight < 1) {
      exercise.weight = null;
    }

    // Validate percentage
    if (exercise.percentage !== null && exercise.percentage < 1) {
      exercise.percentage = null;
    }

    // Validate tempo
    const tempoRegex = /^[0-9x]-[0-9x]-[0-9x]-[0-9x]$/;
    if (exercise.tempo && !tempoRegex.test(exercise.tempo)) {
      exercise.tempo = '';
    }

    // Validate RPE
    if (exercise.rpe !== null) {
      if (exercise.rpe < 1) exercise.rpe = 1;
      if (exercise.rpe > 10) exercise.rpe = 10;
    }

    // Validate break
    if (exercise.breakTime.value !== null && exercise.breakTime.value < 1) {
      exercise.breakTime = { value: null, unit: 's' };
    }
  }

  onTempoInput(event: any, exercise: any): void {
    const input = event.target.value;
    const cleaned = input.replace(/[^0-9x]/g, '');

    let formatted = '';
    for (let i = 0; i < cleaned.length && i < 4; i++) {
      formatted += cleaned[i];
      if (i < 3) {
        formatted += '-';
      }
    }

    exercise.tempo = formatted;
  }

  selectAllText(event: Event) {
    event.stopPropagation();
    const inputElement = event.target as HTMLInputElement;
    inputElement.select();
  }
}
