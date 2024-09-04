import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Result } from "../../interfaces/Result";
import { ResultService } from "../../services/result.service";
import { Macrocycle } from "../../interfaces/Macrocycle";

@Component({
  selector: 'app-adjust-personal-plan-dialog',
  templateUrl: './adjust-personal-plan-dialog.component.html',
  styleUrl: './adjust-personal-plan-dialog.component.scss'
})
export class AdjustPersonalPlanDialogComponent implements OnInit {
  adjustBy1RM: boolean = false;
  adjustByRPE: boolean = false;
  result: Result | null = null;
  updatedMacrocycle: Macrocycle;
  roundTo: number = 2.5;

  k_ratio = 0.12;

  constructor(
    public dialogRef: MatDialogRef<AdjustPersonalPlanDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private resultService: ResultService
  ) {
    this.updatedMacrocycle = JSON.parse(JSON.stringify(data.macrocycle));
  }

  ngOnInit() {
    this.loadResult();
  }

  loadResult(): void {
    const token = localStorage.getItem('token') || '';
    this.resultService.getCurrentResult(this.data.clientId, token)
      .subscribe(result => {
        this.result = result;
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.adjustBy1RM && this.result) {
      this.adjustMacrocycleBy1RM();
      if (this.adjustByRPE) {
        this.adjustMacrocycleByRPE();
      }
    }
    this.dialogRef.close({ updatedMacrocycle: this.updatedMacrocycle });
  }

  adjustMacrocycleBy1RM(): void {

    const squat1RM = this.convertToNumber(this.result?.squat);
    const deadlift1RM = this.convertToNumber(this.result?.deadlift);
    const benchpress1RM = this.convertToNumber(this.result?.benchpress);

    this.updatedMacrocycle.mesocycles.forEach(mesocycle => {
      mesocycle.microcycles.forEach(microcycle => {
        microcycle.workouts.forEach(workout => {
          workout.workoutExercises.forEach(exercise => {
            if (exercise.exerciseType === 'SQUAT') {
              if (squat1RM != null && exercise.percentage) {
                exercise.weight = this.roundDown(squat1RM * exercise.percentage / 100 * exercise.difficultyFactor);
              }
            } else if (exercise.exerciseType === 'DEADLIFT') {
              if (deadlift1RM != null && exercise.percentage) {
                exercise.weight = this.roundDown(deadlift1RM * exercise.percentage / 100 * exercise.difficultyFactor);
              }
            } else if (exercise.exerciseType === 'BENCHPRESS') {
              if (benchpress1RM != null && exercise.percentage) {
                exercise.weight = this.roundDown(benchpress1RM * exercise.percentage / 100 * exercise.difficultyFactor);
              }
            }
          })
        });
      });
    });
  }

  adjustMacrocycleByRPE(): void {
    const squat1RM = this.convertToNumber(this.result?.squat);
    const deadlift1RM = this.convertToNumber(this.result?.deadlift);
    const benchpress1RM = this.convertToNumber(this.result?.benchpress);

    this.updatedMacrocycle.mesocycles.forEach(mesocycle => {
      mesocycle.microcycles.forEach(microcycle => {
        microcycle.workouts.forEach(workout => {
          workout.workoutExercises.forEach(exercise => {
            let maxReps = 0;
            if (exercise.exerciseType === 'SQUAT' && squat1RM != null && exercise.weight != null && exercise.weight != 0 && exercise.rpe != null) {
              maxReps = Math.max(1, (squat1RM * 30 * exercise.difficultyFactor / exercise.weight) - 30);
            } else if (exercise.exerciseType === 'DEADLIFT' && deadlift1RM != null && exercise.weight != null && exercise.weight != 0 && exercise.rpe != null) {
              maxReps = Math.max(1, (deadlift1RM * 30 * exercise.difficultyFactor / exercise.weight) - 30);
            } else if (exercise.exerciseType === 'BENCHPRESS' && benchpress1RM != null && exercise.weight != null && exercise.weight != 0 && exercise.rpe != null) {
              maxReps = Math.max(1, (benchpress1RM * 30 * exercise.difficultyFactor / exercise.weight) - 30);
            }

            if (maxReps > 0 && exercise.rpe != null) {
              const { repetitionsFrom, repetitionsTo } = this.calculateReps(maxReps, exercise.rpe);
              exercise.repetitionsFrom = repetitionsFrom;
              exercise.repetitionsTo = repetitionsTo;
            }
          });
        });
      });
    });
  }

  private convertToNumber = (value: number | string | undefined): number | null => {
    if (value === undefined || value === null) {
      return null;
    }
    return typeof value === 'number' ? value : parseFloat(value);
  };

  private roundDown(weight: number): number {
    if (this.roundTo > 0) {
      return Math.floor(weight / this.roundTo) * this.roundTo;
    }
    return weight;
  }

  private calculateReps(maxReps: number, rpe: number): { repetitionsFrom: number, repetitionsTo: number } {
    const reps = Math.max(1, maxReps * Math.exp(-this.k_ratio * (10 - rpe)));
    const integerPart = Math.floor(reps);
    const fractionalPart = reps - integerPart;

    if (fractionalPart >= 0.8) {
      return {
        repetitionsFrom: integerPart,
        repetitionsTo: integerPart + 1
      };
    } else {
      return {
        repetitionsFrom: integerPart,
        repetitionsTo: integerPart
      };
    }
  }
}
