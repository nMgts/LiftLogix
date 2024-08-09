import {ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AddExerciseToWorkoutDialogComponent } from "../add-exercise-to-workout-dialog/add-exercise-to-workout-dialog.component";
import { Exercise } from "../../interfaces/Exercise";
import { ExerciseDetailsDialogComponent } from "../exercise-details-dialog/exercise-details-dialog.component";

export interface WorkoutExercise {
  exercise: Exercise;
  series: number | null;
  repetitionsFrom: number | null;
  repetitionsTo: number | null;
  weight: number | null;
  percentage: number | null;
  tempo: string;
  rpe: number | null;
  break: {
    value: number | null;
    unit: string;
  };
}

export interface Workout {
  name: string;
  workoutExercises: WorkoutExercise[];
}

export interface Microcycle {
  length: number;
  workouts: { workout: Workout, day: number }[];
}

@Component({
  selector: 'app-workout-creator',
  templateUrl: './workout-creator.component.html',
  styleUrl: './workout-creator.component.scss'
})
export class WorkoutCreatorComponent implements OnInit {
  @Input() isBoxExpanded = false;
  @Output() closeBox = new EventEmitter<void>();
  protected readonly window = window;

  showDropdown: boolean = false;
  showAdvancedOptions = false;

  exampleExercise: Exercise = {
    id: 125,
    name: 'Squat',
    description: 'A basic leg exercise that targets the quadriceps, hamstrings, and glutes.',
    url: 'https://www.example.com/squat-video',
    image: '/icons/dumbbell.jpg',
    body_parts: ['GLUTES', 'QUAD'],
    aliases: [
      { id: 125, alias: 'Przysiad', language: 'pl' },
      { id: 235, alias: 'Squat', language: 'en' }
    ]
  };

  workoutExercises: WorkoutExercise[] = [
    {
      exercise: this.exampleExercise,
      series: 3,
      repetitionsFrom: 8,
      repetitionsTo: 12,
      weight: 100,
      percentage: 70,
      tempo: '1-0-1-0',
      rpe: 7,
      break: { value: 60, unit: 's' }
    }
  ];

  exampleWorkout: Workout = {
    name: 'Trening A',
    workoutExercises: this.workoutExercises
  }

  workouts = [this.exampleWorkout];
  selectedWorkout = this.exampleWorkout;
  addedWorkouts = 1;

  editingExercise: any = null;
  editingField: string = '';
  @ViewChild('inputElement') inputElement: ElementRef | undefined;

  microcycleLength: number = 7;
  microcycle: Microcycle = { length: 7, workouts: [] };
  daysInWeek: string[] = ['PON', 'WT', 'ŚR', 'CZW', 'PT', 'SOB', 'NDZ'];
  microcycleTable: number[][] = [];

  microcycleCellDropdownVisible = false;
  activeCell: any = null;

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    document.addEventListener('click', () => this.closeMicrocycleCellDropdown());
  }

  ngOnInit() {
    this.generateMicrocycleTable();
  }

  /** Workout Unit Methods **/

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.showDropdown = !this.showDropdown;
  }

  cancelAllActions() {
    this.showDropdown = false;
  }

  selectWorkout(workout: Workout) {
    this.selectedWorkout = workout;
    this.showDropdown = false;
  }

  generateWorkoutName(): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let name = '';

    if (this.addedWorkouts < 26) {
      name = `Trening ${alphabet[this.addedWorkouts]}`;
    } else {
      let letters = '';
      let count = this.addedWorkouts;

      while (count >= 0) {
        const remainder = count % 26;
        letters = alphabet[remainder] + letters;
        count = Math.floor(count / 26) - 1;
      }

      name = `Trening ${letters}`;
    }
    return name;
  }

  createNewWorkout() {
    const newWorkout: Workout = {
      name: this.generateWorkoutName(),
      workoutExercises: []
    };
    this.workouts.push(newWorkout);
    this.selectedWorkout = newWorkout;
    this.showDropdown = false;
    this.addedWorkouts++;
  }

  removeWorkout(workout: Workout, event: Event) {
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

  openAddExerciseDialog() {
    const dialogRef = this.dialog.open(AddExerciseToWorkoutDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedWorkout.workoutExercises.push({
          exercise: result,
          series: null,
          repetitionsFrom: null,
          repetitionsTo: null,
          weight: null,
          percentage: null,
          tempo: '1-0-1-0',
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
    this.editingExercise = null;
    this.editingField = '';
  }

  openEditExerciseNameDialog(exercise: any): void {
    const dialogRef = this.dialog.open(AddExerciseToWorkoutDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.selectedWorkout.workoutExercises.findIndex(e => e.exercise.id === exercise.exercise.id);
        if (index !== -1) {
          const updatedWorkoutExercises = [...this.selectedWorkout.workoutExercises];
          updatedWorkoutExercises[index] = { ...this.selectedWorkout.workoutExercises[index], exercise: result };
          this.selectedWorkout.workoutExercises = updatedWorkoutExercises;
        }
      }
    });
  }

  formatRepetitions(exercise: any): string {
    if (exercise.repetitionsFrom !== null && exercise.repetitionsTo !== null) {
      return exercise.repetitionsFrom === exercise.repetitionsTo ? `${exercise.repetitionsFrom}` : `${exercise.repetitionsFrom}-${exercise.repetitionsTo}`;
    } else if (exercise.repetitionsFrom === null && exercise.repetitionsTo !== null) {
      return exercise.repetitionsTo;
    } else if (exercise.repetitionsFrom !== null && exercise.repetitionsTo === null) {
      return exercise.repetitionsFrom;
    } else {
      return '';
    }
  }

  removeExercise(exercise: any): void {
    this.selectedWorkout.workoutExercises = this.selectedWorkout.workoutExercises.filter(e => e !== exercise);
  }

  validateRpe(exercise: WorkoutExercise) {
    if (exercise.rpe !== null) {
      if (exercise.rpe < 1) {
        exercise.rpe = 1;
      } else if (exercise.rpe > 10) {
        exercise.rpe = 10;
      }
    }
  }

  validateTempo(tempo: string): string {
    const regex = /^[0-9x]-[0-9x]-[0-9x]-[0-9x]$/;
    if (!regex.test(tempo)) {
      return '';
    }
    return tempo;
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

  openExerciseDetails(exercise: Exercise, event: Event): void {
    event.stopPropagation();
    this.dialog.open(ExerciseDetailsDialogComponent, {
      data: exercise
    });
  }

  duplicateWorkout(): void {
    const workoutNamePattern = new RegExp(`^(${this.selectedWorkout.name.replace(/\d*$/, '')})(\\d*)$`);
    let maxNumber = 0;

    this.workouts.forEach(workout => {
      const match = workout.name.match(workoutNamePattern);
      if (match) {
        const number = match[2] ? parseInt(match[2]) : 0;
        if (number > maxNumber) {
          maxNumber = number;
        }
      }
    });

    if (maxNumber === 0 && !/\d+$/.test(this.selectedWorkout.name)) {
      this.selectedWorkout.name += '1';
      maxNumber = 1;
    }

    const newWorkout: Workout = {
      name: `${this.selectedWorkout.name.replace(/\d+$/, '')}${maxNumber + 1}`,
      workoutExercises: this.selectedWorkout.workoutExercises.map(exercise => ({
        exercise: { ...exercise.exercise },
        series: exercise.series,
        repetitionsFrom: exercise.repetitionsFrom,
        repetitionsTo: exercise.repetitionsTo,
        weight: exercise.weight,
        percentage: exercise.percentage,
        tempo: exercise.tempo,
        rpe: exercise.rpe,
        break: { ...exercise.break }
      }))
    };

    this.workouts.push(newWorkout);
  }

  /** Microcycle Methods **/

  setMicrocycleLength(value: number) {
    this.microcycleLength = value;
    this.generateMicrocycleTable();
    this.microcycle.length = value;

    this.microcycle.workouts = this.microcycle.workouts.filter(workout => workout.day <= value);

    console.log(this.microcycle);
  }

  generateMicrocycleTable() {
    this.microcycleTable = [];
    const fullWeeks = Math.floor(this.microcycleLength / 7);
    const extraDays = this.microcycleLength % 7;
    let days = 0;

    for (let i = 0; i < fullWeeks; i++) {
      this.microcycleTable.push([1 + days, 2 + days, 3 + days, 4 + days, 5 + days, 6 + days, 7 + days]);
      days += 7;
    }

    if (extraDays > 0) {
      const week = Array(7).fill(0);
      for (let i = 0; i < extraDays; i++) {
        week[i] = i + 1 + days;
      }
      this.microcycleTable.push(week);
    }
  }

  toggleMicrocycleCellDropdown(event: Event, cell: any): void {
    event.stopPropagation();
    this.microcycleCellDropdownVisible = !this.microcycleCellDropdownVisible;
    this.activeCell = cell;
  }

  closeMicrocycleCellDropdown(): void {
    this.microcycleCellDropdownVisible = false;
  }

  addWorkoutToMicrocycle(workout: Workout, day: number): void {
    this.microcycle.workouts.push({workout, day});
  }

  getWorkoutsForDay(day: number): Workout[] {
    return this.microcycle.workouts.filter(entry => entry.day === day).map(entry => entry.workout);
  }

  getWorkoutInitials(name: string): string {
    return name.replace('Trening ', '');
  }

  removeWorkoutFromMicrocycle(workout: Workout, day: number): void {
    const workoutIndex = this.microcycle.workouts.findIndex(w => w.workout === workout && w.day === day);
    if (workoutIndex !== -1) {
      this.microcycle.workouts.splice(workoutIndex, 1);
    }
  }

  /** Other Methods **/

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
