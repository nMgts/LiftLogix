import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter, HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output, Renderer2,
  ViewChild
} from '@angular/core';
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AddExerciseToWorkoutDialogComponent } from "../add-exercise-to-workout-dialog/add-exercise-to-workout-dialog.component";
import { WorkoutExercise } from "../../interfaces/WorkoutExercise";
import { Workout } from "../../interfaces/Workout";
import { Microcycle } from "../../interfaces/Microcycle";
import { Mesocycle } from "../../interfaces/Mesocycle";
import { Macrocycle } from "../../interfaces/Macrocycle";
import { ExerciseOptionsDialogComponent } from "../exercise-options-dialog/exercise-options-dialog.component";
import { SavePlanDialogComponent } from "../save-plan-dialog/save-plan-dialog.component";
import { Plan } from "../../interfaces/Plan";
import { PlanService } from "../../services/plan.service";
import { ExerciseDetailsDialogComponent } from "../exercise-details-dialog/exercise-details-dialog.component";
import { Exercise } from "../../interfaces/Exercise";
import { ExerciseService } from "../../services/exercise.service";
import { AdjustPersonalPlanDialogComponent } from "../adjust-personal-plan-dialog/adjust-personal-plan-dialog.component";
import { PersonalPlan } from "../../interfaces/PersonalPlan";
import { PersonalPlanService } from "../../services/personal-plan.service";
import { WorkoutUnit } from "../../interfaces/WorkoutUnit";
import _ from 'lodash';

@Component({
  selector: 'app-workout-creator',
  templateUrl: './workout-creator.component.html',
  styleUrl: './workout-creator.component.scss'
})
export class WorkoutCreatorComponent implements OnInit, OnDestroy {
  @Output() goBack = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();
  @Input() planId!: number;
  @Input() personalPlan!: PersonalPlan;
  @Input() isPersonalPlan = false;
  @Input() clientId: number | null = null;
  @Input() isFullScreen: boolean = false;
  plan!: Plan;

  protected readonly window = window;
  dropdownOpen: boolean = false;

  showAdvancedOptions = false;
  exampleWorkout: Workout = {
    id: 0,
    name: 'Trening A',
    workoutExercises: [],
    days: []
  }
  exampleWorkoutUnit: WorkoutUnit = {
    id: 0,
    name: 'Trening A',
    workoutExercises: [],
    date: '1970-01-01T00:00:00',
    individual: true,
    duration: 60,
    microcycleDay: -1
  }

  selectedWorkout = this.exampleWorkout;
  selectedWorkoutUnit: WorkoutUnit | null = null;

  editingExercise: any = null;
  editingField: string = '';
  @ViewChild('inputElement') inputElement: ElementRef | undefined;

  microcycleLength: number = 7;
  exampleMicrocycle: Microcycle = {
    length: 7,
    workouts: [
      this.exampleWorkout
    ],
    workoutUnits: []
  };
  daysInWeek: string[] = ['PON', 'WT', 'ŚR', 'CZW', 'PT', 'SOB', 'NDZ'];
  microcycleTable: number[][] = [];

  microcycleCellDropdownVisible = false;
  activeCell: any = null;

  selectedMicrocycle = this.exampleMicrocycle;
  exampleMesocycle: Mesocycle = {
    microcycles: [
      this.exampleMicrocycle
    ]
  };
  microcycleCount: number = 1;
  showMesocycle = true;

  showMacrocycle = true;
  macrocycle: Macrocycle = {
    mesocycles:
      [this.exampleMesocycle]
  };
  selectedMesocycle = this.exampleMesocycle;
  mesocycleCount: number = 1;

  isTouchDevice: boolean = false;
  private clickListener!: () => void;
  private touchListener!: () => void;

  scrollTimeout: any;
  @ViewChild('dropdown', { static: true }) dropdown!: ElementRef;

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
    private planService: PlanService,
    private personalPlanService: PersonalPlanService,
    private exerciseService: ExerciseService
  ) {}

  ngOnInit() {
    if (this.planId) {
      this.loadPlan(this.planId);
    }

    if (this.personalPlan) {
      this.loadPersonalPlan();
    }

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

  /** Personal Plan Methods **/

  loadPersonalPlan() {
    this.macrocycle = { mesocycles: this.personalPlan.mesocycles };
    this.selectMesocycle(0);
    this.generateMicrocycleTable();
  }

  updatePersonalPlan() {
    const token = localStorage.getItem('token') || '';
    this.deleteNotAssignedWorkoutUnits();
    if (!this.validateWorkoutUnits()) {
      return;
    }

    const personalPlan: PersonalPlan = _.cloneDeep(this.personalPlan);

    personalPlan.mesocycles = _.cloneDeep(this.macrocycle.mesocycles);
    personalPlan.length = 0;
    personalPlan.active = true;

    personalPlan.mesocycles.forEach(mesocycle => {
      mesocycle.microcycles.forEach(microcycle => {
        microcycle.workouts.forEach(workout => {
          workout.days.forEach(day => {
            const workoutUnit: WorkoutUnit = {
              id: 0,
              name: workout.name,
              workoutExercises: workout.workoutExercises,
              date: '1970-01-01T00:00:00',
              individual: true,
              duration: 60,
              microcycleDay: day
            };
            microcycle.workoutUnits.push(workoutUnit);
          });
        });
        microcycle.workouts = [];
      });
    });

    this.personalPlanService.editPersonalPlan(personalPlan, token).subscribe(
      () => {
        this.openSnackBar('Plan został zaktualizowany');
        this.onPersonalPlanSaveSuccess();
      },
      () => {
        this.openSnackBar('Nie udało się zaktualizować planu');
      }
    );
  }

  adjustPersonalPlan() {
    const dialogRef = this.dialog.open(AdjustPersonalPlanDialogComponent, {
      data: { clientId: this.clientId, macrocycle: this.macrocycle }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.updatedMacrocycle) {
        this.macrocycle = result.updatedMacrocycle;
        this.selectMesocycle(0);
      }
    });
  }

  savePersonalPlan() {
    const validationResult = this.validateWorkouts();
    if (!validationResult) {
      return;
    }

    const dialogRef = this.dialog.open(SavePlanDialogComponent, {
      data: {
        macrocycle: this.macrocycle,
        planName: this.plan?.name ?? '',
        clientId: this.clientId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.onPersonalPlanSaveSuccess();
      }
    });
  }

  /** Plan Edit Methods **/

  loadPlan(id: number) {
    const token = localStorage.getItem('token') || '';
    this.planService.getPlanDetails(id, token).subscribe({
      next: (plan: Plan) => {
        this.plan = plan;
        this.macrocycle = { mesocycles: this.plan.mesocycles };
        this.selectMesocycle(0);
        this.generateMicrocycleTable();
      },
      error: () => {
        this.openSnackBar('Nie udało się załadować planu');
      }
    });
  }

  editPlan() {
    const validationResult = this.validateWorkouts();
    if (!validationResult) {
      return;
    }

    const token = localStorage.getItem('token') || '';
    const newPlan: Plan = {
      id: this.plan.id,
      name: this.plan.name,
      author: { id: 0, first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com', role: 'COACH' },
      public: this.plan.public,
      mesocycles: this.macrocycle.mesocycles
    };
    this.planService.editPlan(newPlan, token).subscribe({
      next: () => {
        this.openSnackBar('Plan został zaktualizowany');
        this.onGoBack();
      },
      error: () => {
        this.openSnackBar('Nie udało się zaktualizować planu');
      }
    })
  }

  /** Workout Unit Methods **/

  selectWorkout(workout: Workout) {
    this.selectedWorkout = workout;
  }

  createNewWorkout() {
    if (!this.personalPlan) {
      const newWorkout: Workout = {
        id: 0,
        name: this.generateWorkoutName(),
        workoutExercises: [],
        days: []
      };
      this.selectedMicrocycle.workouts.push(newWorkout);
      this.selectedWorkout = newWorkout;
    }
    else {
      const newWorkout: WorkoutUnit = {
        id: 0,
        name: this.generateWorkoutName(),
        workoutExercises: [],
        date: '1970-01-01T00:00:00',
        individual: true,
        duration: 60,
        microcycleDay: -1,
      };
      this.selectedMicrocycle.workoutUnits.push(newWorkout);
      this.selectedWorkoutUnit = newWorkout;
    }
  }

  generateWorkoutName(): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    let uniqueBaseNames;
    if (!this.personalPlan) {
      uniqueBaseNames = new Set<string>(
        this.selectedMicrocycle.workouts.map(workout => workout.name.replace(/\d*$/, '')))
    }
    else {
      uniqueBaseNames = new Set<string>(
        this.selectedMicrocycle.workoutUnits.map(workout => workout.name.replace(/\d*$/, '')))
    }

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

  removeWorkoutUnit(workout: WorkoutUnit, event: Event) {
    event.stopPropagation();

    if (this.selectedMicrocycle.workouts.length > 1) {
      const index = this.selectedMicrocycle.workoutUnits.indexOf(workout);
      if (index !== -1) {
        this.selectedMicrocycle.workouts.splice(index, 1);

        this.updateWorkoutNames();

        if (this.selectedWorkoutUnit === workout) {
          this.selectedWorkoutUnit = this.selectedMicrocycle.workoutUnits.reduce((min, w) =>
            w.microcycleDay < min.microcycleDay ? w : min
          );
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
        if (!this.personalPlan) {
          this.selectedWorkout.workoutExercises.push({
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

        else {
          if (this.selectedWorkoutUnit) {
            this.selectedWorkoutUnit.workoutExercises.push({
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
        }
      }
    });
  }

  openEditExerciseNameDialog(exerciseId: number): void {
    const exercise = this.selectedWorkout.workoutExercises.find(e => e.exerciseId === exerciseId);

    if (exercise) {
      const dialogRef = this.dialog.open(AddExerciseToWorkoutDialogComponent, {
        data: {
          exerciseId: exercise.exerciseId,
          difficultyFactor: exercise.difficultyFactor
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          if (!this.personalPlan) {
            const index = this.selectedWorkout.workoutExercises.findIndex(e => e.exerciseId === exerciseId);
            if (index !== -1) {
              const updatedWorkoutExercises = [...this.selectedWorkout.workoutExercises];
              updatedWorkoutExercises[index] = {
                ...this.selectedWorkout.workoutExercises[index],
                exerciseId: result.exerciseId,
                exerciseName: result.exerciseName,
                exerciseType: result.exerciseType,
                difficultyFactor: result.difficultyFactor
              };
              this.selectedWorkout.workoutExercises = updatedWorkoutExercises;
            }
          }
          else {
            if (this.selectedWorkoutUnit) {
              const index = this.selectedWorkoutUnit.workoutExercises.findIndex(e => e.exerciseId === exerciseId);
              if (index !== -1) {
                const updatedWorkoutExercises = [...this.selectedWorkoutUnit.workoutExercises];
                updatedWorkoutExercises[index] = {
                  ...this.selectedWorkoutUnit.workoutExercises[index],
                  exerciseId: result.exerciseId,
                  exerciseName: result.exerciseName,
                  exerciseType: result.exerciseType,
                  difficultyFactor: result.difficultyFactor
                };
                this.selectedWorkoutUnit.workoutExercises = updatedWorkoutExercises;
              }
            }
          }
        }
      });
    }
  }


  removeExercise(exercise: any): void {
    if (!this.personalPlan) {
      this.selectedWorkout.workoutExercises = this.selectedWorkout.workoutExercises.filter(e => e !== exercise);
    }
    else {
      if (this.selectedWorkoutUnit) {
        this.selectedWorkoutUnit.workoutExercises = this.selectedWorkoutUnit.workoutExercises.filter(e => e !== exercise);
      }
    }
  }

  removeAllExercises(): void {
    if (!this.personalPlan) {
      this.selectedWorkout.workoutExercises = [];
    }
    else {
      if (this.selectedWorkoutUnit) {
        this.selectedWorkout.workoutExercises = [];
      }
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

  duplicateWorkout(): void {
    let workoutNamePattern;
    if (!this.personalPlan) {
      workoutNamePattern = new RegExp(`^(${this.selectedWorkout.name.replace(/\d*$/, '')})(\\d*)$`);
    }
    else {
      // @ts-ignore
      workoutNamePattern = new RegExp(`^(${this.selectedWorkoutUnit.name.replace(/\d*$/, '')})(\\d*)$`);
    }
    let maxNumber = 0;

    if (!this.personalPlan) {
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
        id: 0,
        name: `${this.selectedWorkout.name.replace(/\d+$/, '')}${maxNumber + 1}`,
        workoutExercises: this.selectedWorkout.workoutExercises.map(exercise => ({
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
          exerciseType: exercise.exerciseType,
          difficultyFactor: exercise.difficultyFactor,
          series: exercise.series,
          repetitionsFrom: exercise.repetitionsFrom,
          repetitionsTo: exercise.repetitionsTo,
          weight: exercise.weight,
          percentage: exercise.percentage,
          tempo: exercise.tempo,
          rpe: exercise.rpe,
          breakTime: { ...exercise.breakTime }
        })),
        days: []
      };

      this.selectedMicrocycle.workouts.push(newWorkout);
    }
    else {
      this.selectedMicrocycle.workoutUnits.forEach(workout => {
        const match = workout.name.match(workoutNamePattern);
        if (match) {
          const number = match[2] ? parseInt(match[2]) : 0;
          if (number > maxNumber) {
            maxNumber = number;
          }
        }
      });

      if (this.selectedWorkoutUnit) {
        if (maxNumber === 0 && !/\d+$/.test(this.selectedWorkoutUnit.name)) {
          this.selectedWorkoutUnit.name += '1';
          maxNumber = 1;
        }

        const newWorkout: WorkoutUnit = {
          id: 0,
          name: `${this.selectedWorkoutUnit.name.replace(/\d+$/, '')}${maxNumber + 1}`,
          workoutExercises: this.selectedWorkoutUnit.workoutExercises.map(exercise => ({
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exerciseName,
            exerciseType: exercise.exerciseType,
            difficultyFactor: exercise.difficultyFactor,
            series: exercise.series,
            repetitionsFrom: exercise.repetitionsFrom,
            repetitionsTo: exercise.repetitionsTo,
            weight: exercise.weight,
            percentage: exercise.percentage,
            tempo: exercise.tempo,
            rpe: exercise.rpe,
            breakTime: { ...exercise.breakTime }
          })),
          date: '1970-01-01T00:00:00',
          individual: true,
          duration: 60,
          microcycleDay: -1
        };

        this.selectedMicrocycle.workoutUnits.push(newWorkout);
      }
    }
  }

  openExerciseOptionsDialog(exercise: WorkoutExercise): void {
    const dialogRef = this.dialog.open(ExerciseOptionsDialogComponent, {
      data: {
        exercise: { ...exercise },
        showAdvancedOptions: this.showAdvancedOptions
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const { exercise: updatedExercise } = result;
        if (!this.personalPlan) {
          const index = this.selectedWorkout.workoutExercises.findIndex(e => e.exerciseId === updatedExercise.exerciseId);
          if (index !== -1) {
            this.selectedWorkout.workoutExercises[index] = { ...this.selectedWorkout.workoutExercises[index], ...updatedExercise };
          }
        }
        else {
          if (this.selectedWorkoutUnit) {
            const index = this.selectedWorkoutUnit.workoutExercises.findIndex(e => e.exerciseId === updatedExercise.exerciseId);
            if (index !== -1) {
              this.selectedWorkoutUnit.workoutExercises[index] = { ...this.selectedWorkoutUnit.workoutExercises[index], ...updatedExercise };
            }
          }
        }
      }
    });
  }

  validateWorkouts() {
    let result = true;
    if (!this.validateWorkoutDays()) {
      result = false;
      this.openSnackBar('Błąd - żaden trening nie posiada przypisanego dnia');
    }

    if (!this.validateEmptyWorkouts()) {
      result = false;
      this.openSnackBar('Błąd - znaleziono puste treningi')
    }

    return result;
  }

  validateWorkoutUnits() {
    let result = true;
    if (!this.validateEmptyWorkoutUnits()) {
      result = false;
      this.openSnackBar('Błąd - znaleziono puste treningi');
    }

    return result;
  }

  validateWorkoutDays() {
    let found = false;
    for (let mesocycle of this.macrocycle.mesocycles) {
      for (let microcycle of mesocycle.microcycles) {
        for (let workout of microcycle.workouts) {
          if (workout.days.length > 0) {
            found = true;
          }
        }
      }
    }
    return found;
  }

  deleteNotAssignedWorkoutUnits() {
    for (let mesocycle of this.macrocycle.mesocycles) {
      for (let microcycle of mesocycle.microcycles) {
        microcycle.workoutUnits = microcycle.workoutUnits.filter(workout => workout.microcycleDay >= 1);
      }
    }
  }

  validateEmptyWorkouts() {
    for (let mesocycle of this.macrocycle.mesocycles) {
      for (let microcycle of mesocycle.microcycles) {
        for (let workout of microcycle.workouts) {
          if (workout.workoutExercises.length == 0) {
            return false;
          }
        }
      }
    }
    return true;
  }

  validateEmptyWorkoutUnits() {
    for (let mesocycle of this.macrocycle.mesocycles) {
      for (let microcycle of mesocycle.microcycles) {
        for (let workout of microcycle.workoutUnits) {
          if (workout.workoutExercises.length == 0) {
            return false;
          }
        }
      }
    }
    return true;
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

    if (!this.personalPlan) {
      this.selectedMicrocycle.workouts.forEach(workout => {
        workout.days = workout.days.filter(day => day <= value);
      });
    }
    else {
      this.selectedMicrocycle.workoutUnits.forEach(workout => {
        if (workout.microcycleDay > value) {
          workout.microcycleDay = -1;
        }
      })
    }
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

  addWorkoutUnitToMicrocycle(workout: WorkoutUnit, day: number) {
    const newWorkout = {
      ...workout,
      microcycleDay: day,
      workoutExercises: workout.workoutExercises.map(exercise => ({
        ...exercise,
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        break: { ...exercise.breakTime }
      })),
    };

    this.selectedMicrocycle.workoutUnits.push(newWorkout);
  }

  getWorkoutsForDay(day: number): Workout[] {
    return this.selectedMicrocycle.workouts
      .filter(workout => workout.days.includes(day))
      .map(workout => workout);
  }

  getWorkoutUnitsForDay(day: number): WorkoutUnit[] {
    return this.selectedMicrocycle.workoutUnits
      .filter(workout => workout.microcycleDay === day)
      .map(workout => workout);
  }

  getWorkoutInitials(name: string): string {
    return name.replace('Trening ', '');
  }

  removeWorkoutFromMicrocycle(workout: Workout, day: number): void {
    workout.days = workout.days.filter(d => d !== day);
  }

  removeWorkoutUnitFromMicrocycle(workout: WorkoutUnit): void {
    workout.microcycleDay = -1;
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
      if (!this.personalPlan) {
        for (let i = 0; i < difference; i++) {
          const newMicrocycle: Microcycle = {
            length: this.selectedMicrocycle.length,
            workouts: this.selectedMicrocycle.workouts.map(workout => ({
              ...workout,
              workoutExercises: workout.workoutExercises.map(exercise => ({
                ...exercise,
                exerciseId: exercise.exerciseId,
                exerciseName: exercise.exerciseName,
                break: { ...exercise.breakTime }
              })),
              days: [...workout.days]
            })),
            workoutUnits: []
          };
          this.selectedMesocycle.microcycles.push(newMicrocycle);
        }
      }
      else {
        for (let i = 0; i < difference; i++) {
          const newMicrocycle: Microcycle = {
            length: this.selectedMicrocycle.length,
            workouts: [],
            workoutUnits: this.selectedMicrocycle.workoutUnits.map(workout => ({
              ...workout,
              workoutExercises: workout.workoutExercises.map(exercise => ({
                ...exercise,
                exerciseId: exercise.exerciseId,
                exerciseName: exercise.exerciseName,
                break: { ...exercise.breakTime }
              })),
            }))
          };
          this.selectedMesocycle.microcycles.push(newMicrocycle);
        }
      }
    } else if (difference < 0) {
      this.selectedMesocycle.microcycles.splice(difference);
    }
  }

  selectMicrocycle(index: number) {
    this.selectedMicrocycle = this.selectedMesocycle.microcycles[index];

    if (!this.personalPlan) {
      this.selectedWorkout = this.selectedMicrocycle.workouts[0];
    }
    else {
      this.selectedWorkoutUnit = this.selectedMicrocycle.workoutUnits.reduce((min, w) =>
        w.microcycleDay < min.microcycleDay ? w : min
      );
    }

    this.microcycleLength = this.selectedMicrocycle.length;
    this.generateMicrocycleTable();
  }

  clearMicrocycle(index: number, event: Event) {
    event.stopPropagation();

    let change: boolean = false;
    if (this.selectedMesocycle.microcycles[index] === this.selectedMicrocycle) {
      change = true;
    }

    if (!this.personalPlan) {
      this.selectedMesocycle.microcycles[index] = {
        length: 7,
        workouts: [{
          id: 0,
          name: 'Trening A',
          workoutExercises: [],
          days: []
        }],
        workoutUnits: []
      };
    }
    else {
      this.selectedMesocycle.microcycles[index] = {
        length: 7,
        workouts: [],
        workoutUnits: [{
          id: 0,
          name: 'Trening A',
          workoutExercises: [],
          date: '1970-01-01T00:00:00',
          individual: true,
          duration: 60,
          microcycleDay: -1 }]
      };
    }

    if (change) this.selectMicrocycle(index);
  }

  deleteMicrocycle(index: number, event: Event) {
    event.stopPropagation();
    if (this.selectedMesocycle.microcycles.length > 1) {
      const selectedIndex = this.selectedMesocycle.microcycles.indexOf(this.selectedMicrocycle);
      this.selectedMesocycle.microcycles.splice(index, 1);
      this.microcycleCount--;
      if (index == selectedIndex) {
        this.selectMicrocycle(0);
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
        if (!this.personalPlan) {
          const newMesocycle: Mesocycle = {
            microcycles: this.selectedMesocycle.microcycles.map(microcycle => ({
              length: microcycle.length,
              workouts: microcycle.workouts.map(workout => ({
                ...workout,
                workoutExercises: workout.workoutExercises.map(exercise => ({
                  ...exercise,
                  exerciseId: exercise.exerciseId,
                  exerciseName: exercise.exerciseName,
                  break: { ...exercise.breakTime }
                })),
                days: [...workout.days]
              })),
              workoutUnits: []
            }))
          };
          this.macrocycle.mesocycles.push(newMesocycle);
        }
        else {
          const newMesocycle: Mesocycle = {
            microcycles: this.selectedMesocycle.microcycles.map(microcycle => ({
              length: microcycle.length,
              workouts: [],
              workoutUnits: microcycle.workoutUnits.map(workout => ({
                ...workout,
                workoutExercises: workout.workoutExercises.map(exercise => ({
                  ...exercise,
                  exerciseId: exercise.exerciseId,
                  exerciseName: exercise.exerciseName,
                  break: { ...exercise.breakTime }
                })),
              })),
            }))
          };
          this.macrocycle.mesocycles.push(newMesocycle);
        }
      }
    } else if (difference < 0) {
      this.macrocycle.mesocycles.splice(difference);
    }
  }

  selectMesocycle(index: number) {
    this.selectedMesocycle = this.macrocycle.mesocycles[index];
    this.selectedMicrocycle = this.selectedMesocycle.microcycles[0];
    if (!this.personalPlan) {
      this.selectedWorkout = this.selectedMicrocycle.workouts[0];
    } else {
      this.selectedWorkoutUnit = this.selectedMicrocycle.workoutUnits.reduce((min, w) =>
        w.microcycleDay < min.microcycleDay ? w : min
      );
    }
    this.microcycleLength = this.selectedMicrocycle.length;
    this.microcycleCount = this.selectedMesocycle.microcycles.length;
  }

  clearMesocycle(index: number, event: Event) {
    event.stopPropagation();

    let change: boolean = false;
    if (this.macrocycle.mesocycles[index] === this.selectedMesocycle) {
      change = true;
    }

    if (!this.personalPlan) {
      this.macrocycle.mesocycles[index] = {
        microcycles: [{
          length: 7,
          workouts: [{
            id: 0,
            name: 'Trening A',
            workoutExercises: [],
            days: []
          }],
          workoutUnits: []
        }]
      };
    }
    else {
      this.macrocycle.mesocycles[index] = {
        microcycles: [{
          length: 7,
          workouts: [],
          workoutUnits: [{
            id: 0,
            name: 'Trening A',
            workoutExercises: [],
            date: '1970-01-01T00:00:00',
            individual: true,
            duration: 60,
            microcycleDay: -1
          }]
        }]
      };
    }

    if (change) this.selectMesocycle(index);
  }

  deleteMesocycle(index: number, event: Event) {
    event.stopPropagation();
    if (this.macrocycle.mesocycles.length > 1) {
      const selectedIndex = this.macrocycle.mesocycles.indexOf(this.selectedMesocycle);
      this.macrocycle.mesocycles.splice(index, 1);
      this.mesocycleCount--;
      if (index == selectedIndex) {
        this.selectMesocycle(0);
        this.microcycleCount = this.selectedMesocycle.microcycles.length;
      }
    } else {
      this.openSnackBar("Nie można usunąć wszystkich mezocykli");
    }
  }

  /** Plan Methods **/

  savePlan() {
    const validationResult = this.validateWorkouts();
    if (!validationResult) {
      return;
    }

     const dialogRef = this.dialog.open(SavePlanDialogComponent, {
      data: {
        macrocycle: this.macrocycle
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.onGoBack();
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
    if (exercise.breakTime.value != null) {
      exercise.breakTime.value = Math.floor(exercise.breakTime.value);
      if (exercise.breakTime.value < 1) exercise.breakTime = { value: null, unit: 's' };
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
    this.microcycleCellDropdownVisible = false;
    this.activeCell = null;
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

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.renderer.addClass(document.body, 'show-scrollbar');

    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.renderer.removeClass(document.body, 'show-scrollbar');
    }, 3000);
  }

  private openSnackBar(message: string) {
    this.snackBar.open(message, 'Zamknij', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }

  onGoBack() {
    if (this.clickListener) {
      document.removeEventListener('click', this.clickListener);
    }
    if (this.touchListener) {
      document.removeEventListener('touchstart', this.touchListener);
    }
    this.goBack.emit();
  }

  onPersonalPlanSaveSuccess() {
    if (this.clickListener) {
      document.removeEventListener('click', this.clickListener);
    }
    if (this.touchListener) {
      document.removeEventListener('touchstart', this.touchListener);
    }
    this.success.emit();
    this.goBack.emit();
  }
}
