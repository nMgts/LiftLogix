import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Plan} from "../../interfaces/Plan";
import { PlanService } from "../../services/plan.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Mesocycle } from "../../interfaces/Mesocycle";
import { Microcycle } from "../../interfaces/Microcycle";
import { Workout } from "../../interfaces/Workout";
import { WorkoutExercise } from "../../interfaces/WorkoutExercise";
import { MatDialog } from "@angular/material/dialog";
import { ExerciseDetailsDialogComponent } from "../exercise-details-dialog/exercise-details-dialog.component";
import { WorkoutExerciseDetailsDialogComponent } from "../workout-exercise-details-dialog/workout-exercise-details-dialog.component";
import { ExerciseService} from "../../services/exercise.service";
import { Exercise } from "../../interfaces/Exercise";
import { PersonalPlan } from "../../interfaces/PersonalPlan";
import { PersonalPlanService } from "../../services/personal-plan.service";

@Component({
  selector: 'app-workout-view',
  templateUrl: './workout-view.component.html',
  styleUrl: './workout-view.component.scss'
})
export class WorkoutViewComponent implements OnInit {
  @Output() goBack = new EventEmitter<void>();
  @Input() planId!: number;
  @Input() personalPlan!: PersonalPlan;
  @Input() oldPlanId!: number;
  @Input() isPersonalPlan: boolean = false;
  @Input() isFullScreen: boolean = false;
  plan!: Plan;

  mesocycles: Mesocycle[] = [];
  selectedMesocycle: Mesocycle | null = null;
  microcycles: Microcycle[] = [];
  selectedMicrocycle: Microcycle | null = null;
  workouts: Workout[] = [];
  selectedWorkout: Workout | null = null;
  workoutExercises: WorkoutExercise[] = [];

  daysInWeek: string[] = ['PON', 'WT', 'ŚR', 'CZW', 'PT', 'SOB', 'NDZ'];
  microcycleTable: number[][] = [];

  constructor(
    private planService: PlanService,
    private personalPlanService: PersonalPlanService,
    private exerciseService: ExerciseService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    if (this.planId) {
      this.loadPlan(this.planId);
    }
    if (this.personalPlan) {
      this.loadPersonalPlan()
    }
    if (this.oldPlanId) {
      this.loadOldPlan();
    }
  }

  loadPlan(id: number) {
    const token = localStorage.getItem('token') || '';
    this.planService.getPlanDetails(id, token).subscribe({
      next: (plan: Plan) => {
        this.plan = plan;
        this.mesocycles = this.plan.mesocycles;
        this.selectMesocycle(0);
      },
      error: () => {
        this.openSnackBar('Nie udało się załadować planu');
      }
    });
  }

  loadPersonalPlan() {
    this.mesocycles = this.personalPlan.mesocycles;
    this.selectMesocycle(0);
  }

  loadOldPlan() {
    const token = localStorage.getItem('token') || '';
    this.personalPlanService.getPlanDetails(this.oldPlanId, token).subscribe(
      plan => {
      this.mesocycles = plan.mesocycles;
      this.selectMesocycle(0);
      },
      error => {
        this.openSnackBar('Nie udało się załadować planu');
      }
    )
  }

  selectWorkout(workoutName: string) {
    const workout = this.workouts.find(w => w.name === workoutName);

    if (workout) {
      this.selectedWorkout = workout;
      this.workoutExercises = this.selectedWorkout.workoutExercises;
    } else {
      console.error('Workout not found');
    }
  }

  selectMicrocycle(id: number) {
    this.selectedMicrocycle = this.microcycles[id];
    this.generateMicrocycleTable();
    this.workouts = this.selectedMicrocycle.workouts;
    this.selectWorkout(this.workouts[0].name);
  }

  selectMesocycle(id: number) {
    this.selectedMesocycle = this.mesocycles[id];
    this.microcycles = this.selectedMesocycle.microcycles;
    this.selectMicrocycle(0);
  }

  generateMicrocycleTable() {
    this.microcycleTable = [];
    // @ts-ignore
    const fullWeeks = Math.floor(this.selectedMicrocycle.length / 7);
    // @ts-ignore
    const extraDays = this.selectedMicrocycle.length % 7;
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

  getWorkoutsForDay(day: number): Workout[] {
    return this.workouts
      .filter(workout => workout.days.includes(day))
      .map(workout => workout);
  }

  getWorkoutInitials(name: string): string {
    return name.replace('Trening ', '');
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

  openWorkoutExerciseDetails(exercise: WorkoutExercise) {
    this.dialog.open(WorkoutExerciseDetailsDialogComponent, {
      data: exercise
    });
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

  private openSnackBar(message: string) {
    this.snackBar.open(message, 'Zamknij', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }

  onGoBack() {
    this.goBack.emit();
  }

  protected readonly window = window;
}
