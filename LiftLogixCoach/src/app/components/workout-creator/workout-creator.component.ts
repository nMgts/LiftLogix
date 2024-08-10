import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AddExerciseToWorkoutDialogComponent } from "../add-exercise-to-workout-dialog/add-exercise-to-workout-dialog.component";
import { Exercise } from "../../interfaces/Exercise";
import { ExerciseDetailsDialogComponent } from "../exercise-details-dialog/exercise-details-dialog.component";
import { WorkoutExercise } from "../../interfaces/WorkoutExercise";
import { Workout } from "../../interfaces/Workout";
import { Microcycle } from "../../interfaces/Microcycle";
import {Mesocycle} from "../../interfaces/Mesocycle";
import {Macrocycle} from "../../interfaces/Macrocycle";

@Component({
  selector: 'app-workout-creator',
  templateUrl: './workout-creator.component.html',
  styleUrl: './workout-creator.component.scss'
})
export class WorkoutCreatorComponent implements OnChanges {
  @Input() isBoxExpanded = false;
  @Output() closeBox = new EventEmitter<void>();
  protected readonly window = window;

  showDropdown: boolean = false;
  showAdvancedOptions = false;
  workoutExercises: WorkoutExercise[] = [];
  exampleWorkout: Workout = {
    name: 'Trening A',
    workoutExercises: this.workoutExercises,
    days: []
  }

  selectedWorkout = this.exampleWorkout;
  addedWorkouts = 1;

  editingExercise: any = null;
  editingField: string = '';
  @ViewChild('inputElement') inputElement: ElementRef | undefined;

  microcycleLength: number = 7;
  microcycle: Microcycle = {
    length: 7,
    workouts: [
      this.exampleWorkout
    ]
  };
  daysInWeek: string[] = ['PON', 'WT', 'ŚR', 'CZW', 'PT', 'SOB', 'NDZ'];
  microcycleTable: number[][] = [];

  microcycleCellDropdownVisible = false;
  activeCell: any = null;

  selectedMicrocycle = this.microcycle;
  mesocycle: Mesocycle = { microcycles: [this.microcycle] };
  microcycleCount: number = 1;
  showMesocycle = false;

  showMacrocycle = false;
  macrocycle: Macrocycle = { mesocycles: [this.mesocycle] };
  selectedMesocycle = this.mesocycle;
  mesocycleCount: number = 1;

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    document.addEventListener('click', () => this.closeMicrocycleCellDropdown());
  }

  ngOnChanges() {
    if (this.isBoxExpanded) {
      this.generateMicrocycleTable();
    }
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
      workoutExercises: [],
      days: []
    };
    this.selectedMicrocycle.workouts.push(newWorkout);
    this.selectedWorkout = newWorkout;
    this.showDropdown = false;
    this.addedWorkouts++;
  }

  removeWorkout(workout: Workout, event: Event) {
    event.stopPropagation();
    if (this.microcycle.workouts.length > 1) {
      const index = this.microcycle.workouts.indexOf(workout);
      if (index !== -1) {
        this.microcycle.workouts.splice(index, 1);
        if (this.selectedWorkout === workout) {
          this.selectedWorkout = this.microcycle.workouts[0];
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

    this.microcycle.workouts.forEach(workout => {
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
      })),
      days: []
    };

    this.microcycle.workouts.push(newWorkout);
  }

  /** Microcycle Methods **/

  setMicrocycleLength(value: number) {
    this.microcycleLength = value;
    this.generateMicrocycleTable();
    this.microcycle.length = value;

    this.microcycle.workouts.forEach(workout => {
      workout.days = workout.days.filter(day => day <= value);
    });

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
    workout.days.push(day);
  }

  getWorkoutsForDay(day: number): Workout[] {
    return this.selectedMicrocycle.workouts
      .filter(workout => workout.days.includes(day))
      .map(workout => workout);
  }

  getWorkoutInitials(name: string): string {
    return name.replace('Trening ', '');
  }

  removeWorkoutFromMicrocycle(workout: Workout, day: number): void {
    workout.days = workout.days.filter(d => d !== day);
  }

  /** Mesoocycle Methods **/

  setMicrocycleCount(value: number) {
    if (value < 1) {
      this.microcycleCount = 1;
    } else {
      this.microcycleCount = value;
    }

    const difference = this.microcycleCount - this.selectedMesocycle.microcycles.length;

    if (difference > 0) {
      for (let i = 0; i < difference; i++) {
        const newMicrocycle: Microcycle = {
          length: this.selectedMesocycle.microcycles[0].length,
          workouts: this.selectedMesocycle.microcycles[0].workouts.map(workout => ({
            ...workout,
            workoutExercises: workout.workoutExercises.map(exercise => ({
              ...exercise,
              exercise: { ...exercise.exercise },
              break: { ...exercise.break }
            })),
            days: [...workout.days]
          }))
        };
        this.selectedMesocycle.microcycles.push(newMicrocycle);
      }
    } else if (difference < 0) {
      this.selectedMesocycle.microcycles.splice(difference);
    }
  }

  selectMicrocycle(index: number): void {
    this.selectedMicrocycle = this.selectedMesocycle.microcycles[index];
    this.selectedWorkout = this.selectedMicrocycle.workouts[0];
  }

  deleteMicrocycle(index: number): void {
    if (this.selectedMesocycle.microcycles.length > 1) {
      const selectedIndex = this.selectedMesocycle.microcycles.indexOf(this.selectedMicrocycle);
      this.selectedMesocycle.microcycles.splice(index, 1);
      this.microcycleCount--;
      if (index == selectedIndex) {
        this.selectedMicrocycle = this.selectedMesocycle.microcycles[0];
      }
    } else {
      this.openSnackBar("Nie można usunąć wszystkich mikrocykli");
    }
  }

  /** Macrocycle Methods **/

  setMesocycleCount(value: number) {
    if (value < 1) {
      this.mesocycleCount = 1;
    } else {
      this.mesocycleCount = value;
    }

    const difference = this.mesocycleCount - this.macrocycle.mesocycles.length;

    if (difference > 0) {
      for (let i = 0; i < difference; i++) {
        const newMesocycle: Mesocycle = {
          microcycles: this.macrocycle.mesocycles[0].microcycles.map(microcycle => ({
            length: microcycle.length,
            workouts: microcycle.workouts.map(workout => ({
              ...workout,
              workoutExercises: workout.workoutExercises.map(exercise => ({
                ...exercise,
                exercise: { ...exercise.exercise },
                break: { ...exercise.break }
              })),
              days: [...workout.days]
            }))
          }))
        };
        this.macrocycle.mesocycles.push(newMesocycle);
      }
    } else if (difference < 0) {
      this.macrocycle.mesocycles.splice(difference);
    }
  }

  selectMesocycle(index: number): void {
    this.selectedMesocycle = this.macrocycle.mesocycles[index];
    this.selectedMicrocycle = this.selectedMesocycle.microcycles[0];
    this.selectedWorkout = this.selectedMicrocycle.workouts[0];
  }

  deleteMesocycle(index: number): void {
    if (this.macrocycle.mesocycles.length > 1) {
      const selectedIndex = this.macrocycle.mesocycles.indexOf(this.selectedMesocycle);
      this.macrocycle.mesocycles.splice(index, 1);
      this.mesocycleCount--;
      if (index == selectedIndex) {
        this.selectedMesocycle = this.macrocycle.mesocycles[0];
        this.selectMicrocycle(0);
      }
    } else {
      this.openSnackBar("Nie można usunąć wszystkich mezocykli");
    }
  }

  /** Other Methods **/

  getMesocycleIndex(): number {
    return this.macrocycle.mesocycles.indexOf(this.selectedMesocycle);
  }

  getMicrocycleIndex(): number {
    return this.selectedMesocycle.microcycles.indexOf(this.selectedMicrocycle);
  }

  toRoman(num: number): string {
    const romanNumerals: { [key: number]: string } = {
      1: 'I', 4: 'IV', 5: 'V', 9: 'IX', 10: 'X', 40: 'XL', 50: 'L',
      90: 'XC', 100: 'C', 400: 'CD', 500: 'D', 900: 'CM', 1000: 'M'
    };
    let result = '';
    const keys = Object.keys(romanNumerals).map(Number).reverse();

    for (const key of keys) {
      while (num >= key) {
        result += romanNumerals[key];
        num -= key;
      }
    }

    return result;
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
