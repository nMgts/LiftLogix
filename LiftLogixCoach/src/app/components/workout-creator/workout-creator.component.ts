import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AddExerciseToWorkoutDialogComponent } from "../add-exercise-to-workout-dialog/add-exercise-to-workout-dialog.component";
import { WorkoutExercise } from "../../interfaces/WorkoutExercise";
import { Workout } from "../../interfaces/Workout";
import { Microcycle } from "../../interfaces/Microcycle";
import { Mesocycle } from "../../interfaces/Mesocycle";
import { Macrocycle } from "../../interfaces/Macrocycle";
import {ExerciseOptionsDialogComponent} from "../exercise-options-dialog/exercise-options-dialog.component";
import {SavePlanDialogComponent} from "../save-plan-dialog/save-plan-dialog.component";

@Component({
  selector: 'app-workout-creator',
  templateUrl: './workout-creator.component.html',
  styleUrl: './workout-creator.component.scss'
})
export class WorkoutCreatorComponent implements OnInit, OnDestroy {
  protected readonly window = window;
  dropdownOpen: boolean = false;

  showAdvancedOptions = false;
  exampleWorkout: Workout = {
    name: 'Trening A',
    workoutExercises: [],
    days: []
  }

  selectedWorkout = this.exampleWorkout;

  editingExercise: any = null;
  editingField: string = '';
  @ViewChild('inputElement') inputElement: ElementRef | undefined;

  microcycleLength: number = 7;
  exampleMicrocycle: Microcycle = {
    length: 7,
    workouts: [
      this.exampleWorkout
    ]
  };
  daysInWeek: string[] = ['PON', 'WT', 'ŚR', 'CZW', 'PT', 'SOB', 'NDZ'];
  microcycleTable: number[][] = [];

  microcycleCellDropdownVisible = false;
  activeCell: any = null;

  selectedMicrocycle = this.exampleMicrocycle;
  exampleMesocycle: Mesocycle = { microcycles: [this.exampleMicrocycle] };
  microcycleCount: number = 1;
  showMesocycle = true;

  showMacrocycle = true;
  macrocycle: Macrocycle = { mesocycles: [this.exampleMesocycle] };
  selectedMesocycle = this.exampleMesocycle;
  mesocycleCount: number = 1;

  isTouchDevice: boolean = false;
  private clickListener!: () => void;
  private touchListener!: () => void;

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.generateMicrocycleTable();
    this.detectTouchDevice();
    this.addTouchListener();
    this.addClickListener();
  }

  ngOnDestroy() {
    if (this.clickListener) {
      document.removeEventListener('click', this.clickListener);
    }
    if (this.touchListener) {
      document.removeEventListener('touchstart', this.touchListener);
    }
  }

  /** Workout Unit Methods **/

  selectWorkout(workout: Workout) {
    this.selectedWorkout = workout;
  }

  createNewWorkout() {
    const newWorkout: Workout = {
      name: this.generateWorkoutName(),
      workoutExercises: [],
      days: []
    };
    this.selectedMicrocycle.workouts.push(newWorkout);
    this.selectedWorkout = newWorkout;
  }

  generateWorkoutName(): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    const uniqueBaseNames = new Set(
      this.selectedMicrocycle.workouts.map(workout => workout.name.replace(/\d*$/, ''))
    );

    const workoutCount = uniqueBaseNames.size;
    let name;

    if (workoutCount < 26) {
      name = `Trening ${alphabet[workoutCount]}`;
    } else {
      let letters = '';
      let count = workoutCount;

      while (count >= 0) {
        const remainder = count % 26;
        letters = alphabet[remainder] + letters;
        count = Math.floor(count / 26) - 1;
      }

      name = `Trening ${letters}`;
    }

    return name;
  }

  removeWorkout(workout: Workout, event: Event) {
    event.stopPropagation();

    if (this.selectedMicrocycle.workouts.length > 1) {
      const index = this.selectedMicrocycle.workouts.indexOf(workout);
      if (index !== -1) {
        this.selectedMicrocycle.workouts.splice(index, 1);

        this.updateWorkoutNames();

        if (this.selectedWorkout === workout) {
          this.selectedWorkout = this.selectedMicrocycle.workouts[0];
        }
      }
    } else {
      this.openSnackBar("Nie można usunąć wszystkich treningów");
    }
  }

  updateWorkoutNames() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const uniqueWorkouts: { [key: string]: Workout[] } = {};

    this.selectedMicrocycle.workouts.forEach(workout => {
      const baseName = workout.name.replace(/\d*$/, '');
      if (!uniqueWorkouts[baseName]) {
        uniqueWorkouts[baseName] = [];
      }
      uniqueWorkouts[baseName].push(workout);
    });

    let currentLetterIndex = 0;
    for (let letter in uniqueWorkouts) {
      const workoutsGroup = uniqueWorkouts[letter];
      const newBaseName = `Trening ${alphabet[currentLetterIndex++]}`;

      workoutsGroup.forEach((workout, i) => {
        if (workoutsGroup.length > 1) {
          workout.name = `${newBaseName}${i + 1}`;
        } else {
          workout.name = newBaseName;
        }
      });
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

  removeExercise(exercise: any): void {
    this.selectedWorkout.workoutExercises = this.selectedWorkout.workoutExercises.filter(e => e !== exercise);
  }

  openExerciseDetails(exercise: any, event: Event): void {
    event.stopPropagation();
    this.dialog.open(ExerciseOptionsDialogComponent, {
      data: {
        exercise: exercise,
        showAdvancedOptions: this.showAdvancedOptions
      }
    });
  }

  duplicateWorkout(): void {
    const workoutNamePattern = new RegExp(`^(${this.selectedWorkout.name.replace(/\d*$/, '')})(\\d*)$`);
    let maxNumber = 0;

    this.selectedMicrocycle.workouts.forEach(workout => {
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

    this.selectedMicrocycle.workouts.push(newWorkout);
  }

  openExerciseOptionsDialog(exercise: WorkoutExercise): void {
    const dialogRef = this.dialog.open(ExerciseOptionsDialogComponent, {
      data: {
        exercise,
        showAdvancedOptions: this.showAdvancedOptions
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const { exercise: updatedExercise } = result;
        const index = this.selectedWorkout.workoutExercises.findIndex(e => e.exercise.id === updatedExercise.exercise.id);
        if (index !== -1) {
          this.selectedWorkout.workoutExercises[index] = { ...this.selectedWorkout.workoutExercises[index], ...updatedExercise };
        }
      }
    });
  }

  /** Microcycle Methods **/

  setMicrocycleLength(value: number) {
    value = this.validatePositiveNumbers(value);
    value = value > 28 ? 28 : value;
    this.microcycleLength = value;

    const inputElement = document.getElementById('microcycle-length') as HTMLInputElement;
    inputElement.value = String(value);
    inputElement.dispatchEvent(new Event('input'));

    this.generateMicrocycleTable();
    this.selectedMicrocycle.length = value;

    this.selectedMicrocycle.workouts.forEach(workout => {
      workout.days = workout.days.filter(day => day <= value);
    });
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

  toggleMicrocycleCellDropdown(event: Event, cell: any) {
    event.stopPropagation();
    this.microcycleCellDropdownVisible = !this.microcycleCellDropdownVisible;
    this.activeCell = cell;
  }

  closeMicrocycleCellDropdown() {
    this.microcycleCellDropdownVisible = false;
  }

  addWorkoutToMicrocycle(workout: Workout, day: number) {
    if (!workout.days.includes(day)) {
      workout.days.push(day);
    }
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
    value = this.validatePositiveNumbers(value);
    value = value > 10 ? 10 : value;
    this.microcycleCount = value;

    const inputElement = document.getElementById('microcycle-count') as HTMLInputElement;
    inputElement.value = String(value);
    inputElement.dispatchEvent(new Event('input'));

    const difference = this.microcycleCount - this.selectedMesocycle.microcycles.length;

    if (difference > 0) {
      for (let i = 0; i < difference; i++) {
        const newMicrocycle: Microcycle = {
          length: this.selectedMicrocycle.length,
          workouts: this.selectedMicrocycle.workouts.map(workout => ({
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

  selectMicrocycle(index: number) {
    this.selectedMicrocycle = this.selectedMesocycle.microcycles[index];
    this.selectedWorkout = this.selectedMicrocycle.workouts[0];
    this.microcycleLength = this.selectedMicrocycle.length;
    this.generateMicrocycleTable();
  }

  deleteMicrocycle(index: number, event: Event) {
    event.stopPropagation();
    if (this.selectedMesocycle.microcycles.length > 1) {
      const selectedIndex = this.selectedMesocycle.microcycles.indexOf(this.selectedMicrocycle);
      this.selectedMesocycle.microcycles.splice(index, 1);
      this.microcycleCount--;
      if (index == selectedIndex) {
        this.selectedMicrocycle = this.selectedMesocycle.microcycles[0];
        this.microcycleLength = this.selectedMicrocycle.length;
        this.generateMicrocycleTable();
      }
    } else {
      this.openSnackBar("Nie można usunąć wszystkich mikrocykli");
    }
  }

  /** Macrocycle Methods **/

  setMesocycleCount(value: number) {
    value = this.validatePositiveNumbers(value);
    value = value > 10 ? 10 : value;
    this.mesocycleCount = value;

    const inputElement = document.getElementById('mesocycle-count') as HTMLInputElement;
    inputElement.value = String(value);
    inputElement.dispatchEvent(new Event('input'));

    const difference = this.mesocycleCount - this.macrocycle.mesocycles.length;

    if (difference > 0) {
      for (let i = 0; i < difference; i++) {
        const newMesocycle: Mesocycle = {
          microcycles: this.selectedMesocycle.microcycles.map(microcycle => ({
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

  selectMesocycle(index: number) {
    this.selectedMesocycle = this.macrocycle.mesocycles[index];
    this.selectedMicrocycle = this.selectedMesocycle.microcycles[0];
    this.selectedWorkout = this.selectedMicrocycle.workouts[0];
    this.microcycleLength = this.selectedMicrocycle.length;
    this.microcycleCount = this.selectedMesocycle.microcycles.length;
  }

  deleteMesocycle(index: number, event: Event) {
    event.stopPropagation();
    if (this.macrocycle.mesocycles.length > 1) {
      const selectedIndex = this.macrocycle.mesocycles.indexOf(this.selectedMesocycle);
      this.macrocycle.mesocycles.splice(index, 1);
      this.mesocycleCount--;
      if (index == selectedIndex) {
        this.selectedMesocycle = this.macrocycle.mesocycles[0];
        this.selectMicrocycle(0);
        this.microcycleCount = this.selectedMesocycle.microcycles.length;
      }
    } else {
      this.openSnackBar("Nie można usunąć wszystkich mezocykli");
    }
  }

  /** Plan Methods **/

  savePlan() {
    this.dialog.open(SavePlanDialogComponent, {
      data: {
        macrocycle: this.macrocycle
      }
    });
  }

  /** Validate / TextFormat Methods **/

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
      if (exercise.series < 1) exercise.series = null;
    }
    this.endEdit();
  }

  validateRepetitions(exercise: WorkoutExercise) {
    if (exercise.repetitionsFrom !== null) {
      if (exercise.repetitionsFrom < 1) exercise.repetitionsFrom = null;
    }
    if (exercise.repetitionsTo !== null) {
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
    if (exercise.break.value != null) {
      if (exercise.break.value < 1) exercise.break = { value: null, unit: 's' };
    }
  }

  validatePositiveNumbers(value: number): number {
    if (value < 1) {
      return 1;
    }
    return value;
  }

  /** Other Methods **/

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

  detectTouchDevice() {
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  addTouchListener() {
    this.touchListener = () => {
      this.isTouchDevice = true;
    };
    document.addEventListener('touchstart', this.touchListener, { once: true });
  }

  addClickListener() {
    this.clickListener = () => this.closeMicrocycleCellDropdown();
    document.addEventListener('click', this.clickListener);
  }

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

  private openSnackBar(message: string) {
    this.snackBar.open(message, 'Zamknij', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }

  close(event: Event) {
    event.stopPropagation();
    if (this.clickListener) {
      document.removeEventListener('click', this.clickListener);
    }
    if (this.touchListener) {
      document.removeEventListener('touchstart', this.touchListener);
    }
  }
}
