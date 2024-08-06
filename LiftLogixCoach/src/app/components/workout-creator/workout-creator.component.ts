import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatDialog } from "@angular/material/dialog";
import { AddWorkoutDialogComponent } from "../add-workout-dialog/add-workout-dialog.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AddExerciseToWorkoutDialogComponent } from "../add-exercise-to-workout-dialog/add-exercise-to-workout-dialog.component";
import { EditExerciseNameDialogComponent } from "../edit-exercise-name-dialog/edit-exercise-name-dialog.component";

export interface Exercise {
  name: string;
  series: number | null;
  repetitionsFrom: number | null;
  repetitionsTo: number | null;
  tempo: string;
  percentage: number | null;
  rpe: number | null;
  break: {
    value: number | null;
    unit: string;
  };
}

@Component({
  selector: 'app-workout-creator',
  templateUrl: './workout-creator.component.html',
  styleUrl: './workout-creator.component.scss'
})
export class WorkoutCreatorComponent {
  @Input() isBoxExpanded = false;
  @Output() closeBox = new EventEmitter<void>();
  protected readonly window = window;

  selectedWorkout: string = 'Trening A';
  showDropdown: boolean = false;
  workouts: string[] = ['Trening A'];
  originalWorkoutName: string = '';

  exercises: Exercise[] = [
    {
      name: 'Push-up',
      series: 3,
      repetitionsFrom: 8,
      repetitionsTo: 12,
      tempo: '1-0-1-0',
      percentage: 70,
      rpe: 7,
      break: { value: 60, unit: 's' }
    }
  ];

  editingExercise: any = null;
  editingField: string = '';
  @ViewChild('inputElement') inputElement: ElementRef | undefined;

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.showDropdown = !this.showDropdown;
  }

  cancelAllActions() {
    this.showDropdown = false;
  }

  selectWorkout(workout: string) {
    this.selectedWorkout = workout;
    this.originalWorkoutName = workout;
    this.showDropdown = false;
  }

  openAddWorkoutDialog() {
    const dialogRef = this.dialog.open(AddWorkoutDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.workouts.push(result);
      }
    });
  }

  removeWorkout(workout: string, event: Event) {
    event.stopPropagation();
    if (this.workouts.length > 1) {
      const index = this.workouts.indexOf(workout);
      if (index !== -1) {
        this.workouts.splice(index, 1);
        if (this.selectedWorkout === workout) {
          this.selectedWorkout = this.workouts[0];
        }
      }
    } else {
      this.openSnackBar("Nie można usunąć wszystkich treningów");
    }
  }

  updateWorkoutName(newName: string) {
    const index = this.workouts.indexOf(this.originalWorkoutName);
    if (index !== -1) {
      this.workouts[index] = newName;
      this.originalWorkoutName = newName;
    }
  }

  onWorkoutNameFocus() {
    this.originalWorkoutName = this.selectedWorkout;
  }

  openAddExerciseDialog() {
    const dialogRef = this.dialog.open(AddExerciseToWorkoutDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.exercises.push({
          name: result,
          series: null,
          repetitionsFrom: null,
          repetitionsTo: null,
          tempo: '1-0-1-0',
          percentage: null,
          rpe: null,
          break: {value: null, unit: 's'}
        });
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

  endEdit(exercise: any, field: string) {
    if (field === 'tempo') {
      exercise.tempo = this.validateTempo(exercise.tempo);
    }
    console.log(exercise);
    this.editingExercise = null;
    this.editingField = '';
  }

  openEditExerciseNameDialog(exercise: any): void {
    const dialogRef = this.dialog.open(EditExerciseNameDialogComponent, {
      data: { name: exercise.name }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        exercise.name = result;
      }
    });
  }

  formatRepetitions(exercise: any): string {
    if (exercise.repetitionsFrom !== null && exercise.repetitionsTo !== null) {
      return exercise.repetitionsFrom === exercise.repetitionsTo ? `${exercise.repetitionsFrom}` : `${exercise.repetitionsFrom}-${exercise.repetitionsTo}`;
    }
    return '';
  }

  removeExercise(exercise: any): void {
    this.exercises = this.exercises.filter(e => e !== exercise);
  }

  validateRpe(exercise: Exercise) {
    if (exercise.rpe !== null) {
      if (exercise.rpe < 1) {
        exercise.rpe = 1;
      } else if (exercise.rpe > 10) {
        exercise.rpe = 10;
      }
    }
  }

  validateTempo(tempo: string): string {
    const segments = tempo.split('-');
    return segments.map(segment => segment.replace(/[^0-9x]/g, '')).join('-');
  }

  private openSnackBar(message: string): void {
    this.snackBar.open(message, 'Zamknij', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }

  close(event: Event) {
    event.stopPropagation();
    this.closeBox.emit();
  }
}
