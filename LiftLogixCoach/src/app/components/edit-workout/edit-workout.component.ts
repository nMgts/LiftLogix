import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { WorkoutUnit } from "../../interfaces/WorkoutUnit";
import { WorkoutService } from "../../services/workout.service";
import { AddExerciseToWorkoutDialogComponent } from "../add-exercise-to-workout-dialog/add-exercise-to-workout-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { Exercise } from "../../interfaces/Exercise";
import { ExerciseDetailsDialogComponent } from "../exercise-details-dialog/exercise-details-dialog.component";
import { ExerciseService } from "../../services/exercise.service";
import { WorkoutExercise } from "../../interfaces/WorkoutExercise";
import { ExerciseOptionsDialogComponent } from "../exercise-options-dialog/exercise-options-dialog.component";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: 'app-edit-workout',
  templateUrl: './edit-workout.component.html',
  styleUrl: './edit-workout.component.scss'
})
export class EditWorkoutComponent implements OnInit {
  @Output() goBack = new EventEmitter<void>();
  @Input() workoutId: number = 0;
  @Input() isFullScreen: boolean = false;
  workout!: WorkoutUnit;

  editingExercise: any = null;
  editingField: string = '';
  @ViewChild('inputElement') inputElement: ElementRef | undefined;

  protected readonly window = window;

  constructor(
    private workoutService: WorkoutService,
    private exerciseService: ExerciseService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadWorkout();
  }

  loadWorkout() {
    const token = localStorage.getItem('token') || '';
    this.workoutService.getWorkout(this.workoutId, token).subscribe(
      response => {
      this.workout = response;
    }, error => {
        console.error('Nie udało się załadować treningu', error);
      })
  }

  saveWorkout() {
    const token = localStorage.getItem('token') || '';

    if (this.workout.workoutExercises.length == 0) {
      this.openSnackBar('Trening nie może być pusty');
      return;
    }

    this.workoutService.editWorkout(this.workout, token).subscribe(
      () => {
        this.openSnackBar('Plan został zaktualizowany');
        this.onGoBack();
      }, () => {
        this.openSnackBar('Nie udało się zaktualizować planu');
      }
    );
  }

  openAddExerciseDialog() {
    const dialogRef = this.dialog.open(AddExerciseToWorkoutDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.workout.workoutExercises.push({
          exerciseId: result.exerciseId,
          exerciseName: result.exerciseName,
          exerciseType: result.exerciseType,
          difficultyFactor: result.difficultyFactor,
          series: null,
          repetitionsFrom: null,
          repetitionsTo: null,
          weight: null,
          percentage: null,
          tempo: '1-0-1-0',
          rpe: null,
          breakTime: {value: null, unit: 's'}
        });
      }
    });
  }

  removeExercise(exercise: any): void {
    this.workout.workoutExercises = this.workout.workoutExercises.filter(e => e !== exercise);
  }

  removeAllExercises(): void {
    this.workout.workoutExercises = [];
  }

  openEditExerciseNameDialog(exerciseId: number): void {
    const exercise = this.workout.workoutExercises.find(e => e.exerciseId === exerciseId);

    if (exercise) {
      const dialogRef = this.dialog.open(AddExerciseToWorkoutDialogComponent, {
        data: {
          exerciseId: exercise.exerciseId,
          difficultyFactor: exercise.difficultyFactor
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          const index = this.workout.workoutExercises.findIndex(e => e.exerciseId === exerciseId);
          if (index !== -1) {
            const updatedWorkoutExercises = [...this.workout.workoutExercises];
            updatedWorkoutExercises[index] = {
              ...this.workout.workoutExercises[index],
              exerciseId: result.exerciseId,
              exerciseName: result.exerciseName,
              exerciseType: result.exerciseType,
              difficultyFactor: result.difficultyFactor
            };
            this.workout.workoutExercises = updatedWorkoutExercises;
          }
        }
      });
    }
  }

  openExerciseDetails(exerciseId: number, event: Event): void {
    event.stopPropagation();

    const token = localStorage.getItem('token') || '';
    this.exerciseService.getExerciseDetails(exerciseId, token).subscribe({
      next: (exercise: Exercise) => {
        this.dialog.open(ExerciseDetailsDialogComponent, {
          data: exercise
        });
      },
      error: (err) => {
        console.error('Error fetching exercise details:', err);
      }
    });
  }

  openExerciseOptionsDialog(exercise: WorkoutExercise): void {
    const dialogRef = this.dialog.open(ExerciseOptionsDialogComponent, {
      data: {
        exercise: { ...exercise },
        showAdvancedOptions: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const { exercise: updatedExercise } = result;
        const index = this.workout.workoutExercises.findIndex(e => e.exerciseId === updatedExercise.exerciseId);
        if (index !== -1) {
          this.workout.workoutExercises[index] = { ...this.workout.workoutExercises[index], ...updatedExercise };
        }
      }
    });
  }

  editCell(exercise: any, field: string) {
    this.editingExercise = exercise;
    this.editingField = field;
    this.cdr.detectChanges();

    setTimeout(() => {
      const inputElement = this.inputElement?.nativeElement;
      if (inputElement) {
        inputElement.focus();
      }
    }, 0);
  }

  isEditing(exercise: any, field: string) {
    return this.editingExercise === exercise && this.editingField === field;
  }

  endEdit() {
    this.editingExercise = null;
    this.editingField = '';
  }

  selectAllText(event: Event) {
    event.stopPropagation();
    const inputElement = event.target as HTMLInputElement;
    inputElement.select();
  }

  validateSeries(exercise: WorkoutExercise) {
    if (exercise.series !== null) {
      exercise.series = Math.floor(exercise.series);
      if (exercise.series < 1) exercise.series = null;
    }
    this.endEdit();
  }

  validateRepetitions(exercise: WorkoutExercise) {
    if (exercise.repetitionsFrom !== null) {
      exercise.repetitionsFrom = Math.floor(exercise.repetitionsFrom);
      if (exercise.repetitionsFrom < 1) exercise.repetitionsFrom = null;
    }
    if (exercise.repetitionsTo !== null) {
      exercise.repetitionsTo = Math.floor(exercise.repetitionsTo);
      if (exercise.repetitionsTo < 1) exercise.repetitionsTo = null;
    }
    if (exercise.repetitionsTo !== null && exercise.repetitionsFrom !== null) {
      if (exercise.repetitionsFrom > exercise.repetitionsTo) {
        let temp = exercise.repetitionsFrom;
        exercise.repetitionsFrom = exercise.repetitionsTo;
        exercise.repetitionsTo = temp;
      }
    }
  }

  validateWeight(exercise: WorkoutExercise) {
    if (exercise.weight !== null) {
      if (exercise.weight < 1) exercise.weight = null;
    }
    this.endEdit();
  }

  validatePercentage(exercise: WorkoutExercise) {
    if (exercise.percentage !== null) {
      if (exercise.percentage < 1) exercise.percentage = null;
    }
    this.endEdit();
  }

  onTempoInput(event: any, exercise: any) {
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

  validateTempo(exercise: WorkoutExercise) {
    const regex = /^[0-9x]-[0-9x]-[0-9x]-[0-9x]$/;
    if (!regex.test(exercise.tempo)) {
      exercise.tempo = '';
    }
    this.endEdit();
  }

  validateRpe(exercise: WorkoutExercise) {
    if (exercise.rpe !== null) {
      if (exercise.rpe < 1) {
        exercise.rpe = 1;
      } else if (exercise.rpe > 10) {
        exercise.rpe = 10;
      }
    }
    this.endEdit();
  }

  validateBreak(exercise: WorkoutExercise) {
    if (exercise.breakTime.value != null) {
      exercise.breakTime.value = Math.floor(exercise.breakTime.value);
      if (exercise.breakTime.value < 1) exercise.breakTime = { value: null, unit: 's' };
    }
  }

  endEditIfNotFocusedOnOtherInput(field: string, event: FocusEvent) {
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (field === 'repetitions') {
      if (!relatedTarget || !relatedTarget.closest('.repetitions-inputs')) {
        this.endEdit();
      }
    }
    if (field === 'break') {
      if (!relatedTarget || !relatedTarget.closest('.break-input')) {
        this.endEdit();
      }
    }
  }

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

  private openSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }

  onGoBack() {
    this.goBack.emit();
  }
}
