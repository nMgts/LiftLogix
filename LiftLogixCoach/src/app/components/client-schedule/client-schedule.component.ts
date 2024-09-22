import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ClientService } from "../../services/client.service";
import { PersonalPlanService } from "../../services/personal-plan.service";
import { Workout } from "../../interfaces/Workout";
import { Day } from "../../interfaces/Day";
import { Subscription } from "rxjs";
import { PersonalPlan } from "../../interfaces/PersonalPlan";
import { MatSnackBar } from "@angular/material/snack-bar";
import { WorkoutUnit } from "../../interfaces/WorkoutUnit";

@Component({
  selector: 'app-client-schedule',
  templateUrl: './client-schedule.component.html',
  styleUrl: './client-schedule.component.scss'
})
export class ClientScheduleComponent implements OnInit, OnDestroy {
  @Output() goBack = new EventEmitter<void>();
  @Input() clientId: number | null = null;
  @Input() isFullScreen: boolean = false;
  private clientIdSubscription!: Subscription;

  protected readonly window = window;

  nav = 0;
  clickedDay: Day | null = null;

  weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  days: Day[] = [];
  paddingDays = 0;
  displayedMonth = '';

  monthTranslations: { [key: string]: string } = {
    'January': 'Styczeń',
    'February': 'Luty',
    'March': 'Marzec',
    'April': 'Kwiecień',
    'May': 'Maj',
    'June': 'Czerwiec',
    'July': 'Lipiec',
    'August': 'Sierpień',
    'September': 'Wrzesień',
    'October': 'Październik',
    'November': 'Listopad',
    'December': 'Grudzień'
  };

  workouts: WorkoutUnit[] = [];

  selectedPlan: PersonalPlan | null = null;
  selectedWorkoutId: number = 0;

  constructor(
    private clientService: ClientService,
    private personalPlanService: PersonalPlanService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.clientIdSubscription =this.clientService.selectedClientId$.subscribe(clientId => {
      this.clientId = clientId;
      if (this.clientId !== null) {
        this.loadWorkouts(this.clientId);
      }
    });

    this.loadCalendar();
  }

  ngOnDestroy() {
    this.clientIdSubscription.unsubscribe();
  }

  loadCalendar() {
    const dt = new Date();

    if (this.nav !== 0) {
      dt.setMonth(new Date().getMonth() + this.nav);
    }

    const month = dt.getMonth();
    const year = dt.getFullYear();

    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dateString = firstDayOfMonth.toLocaleDateString('en-us', {
      weekday: 'long',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    this.paddingDays = this.weekdays.indexOf(dateString.split(', ')[0]);

    const monthName = dt.toLocaleDateString('en-us', { month: 'long' });
    this.displayedMonth = `${this.monthTranslations[monthName]} ${year}`;

    this.days = [];

    for (let i = 1; i <= daysInMonth; i++) {
      this.days.push({
        day: i,
        month: month,
        year: year,
        events: []
      });
    }

    this.updateDaysWithWorkouts();
  }

  async loadWorkouts(clientId: number) {
    const token = localStorage.getItem('token') || '';
    this.personalPlanService.getActivePlan(clientId, token).subscribe(
      (plan) => {
        this.workouts = plan.mesocycles.flatMap(mesocycle =>
          mesocycle.microcycles.flatMap(microcycle =>
            microcycle.workoutUnits));
        this.updateDaysWithWorkouts();
      },
      () => {
        this.workouts = [];
        this.updateDaysWithWorkouts();
      }
    )
  }

  updateDaysWithWorkouts() {
    this.days.forEach(day => {
      day.events = this.workouts
        .filter(workout => {
          const workoutDate = new Date(workout.date);
          return workoutDate.getDate() === day.day &&
            workoutDate.getMonth() === day.month &&
            workoutDate.getFullYear() === day.year;
        })
        .sort((a, b) => {
          const timeA = new Date(a.date).getTime();
          const timeB = new Date(b.date).getTime();
          return timeA - timeB;
        });
    });
  }

  onPreviousMonth() {
    this.nav--;
    this.loadCalendar();
  }

  onNextMonth() {
    this.nav++;
    this.loadCalendar();
  }

  getWorkoutInitials(name: string): string {
    return name.replace('Trening ', '');
  }

  getEventClass(event: WorkoutUnit): string {
    return event.individual ? 'individual-workout' : 'non-individual-workout';
  }

  openDayDetails(day: Day) {
    this.clickedDay = day;

    setTimeout(() => {
      const element = document.getElementById('workout-day-details');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 1);
  }

  closeDayDetails() {
    this.clickedDay = null;
  }

  viewWorkout(workoutId: number) {
    this.selectedWorkoutId = workoutId;

    const token = localStorage.getItem('token') || '';
    this.personalPlanService.getPersonalPlanByWorkout(workoutId, token).subscribe(
      (plan) => {
        this.selectedPlan = plan;
      },
      () => {
        this.openSnackBar('Nie udało się wczytać planu');
      }
    )
  }

  closeWorkoutView() {
    this.selectedWorkoutId = 0;
    this.selectedPlan = null;
  }

  onUpdate() {
    if (this.clientId) {
      this.loadWorkouts(this.clientId);
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
