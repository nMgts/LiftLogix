import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription } from "rxjs";
import { ClientService } from "../../services/client.service";
import { PersonalPlanService } from "../../services/personal-plan.service";
import { Workout } from "../../interfaces/Workout";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Day } from "../../interfaces/Day";

@Component({
  selector: 'app-client-schedule',
  templateUrl: './client-schedule.component.html',
  styleUrl: './client-schedule.component.scss'
})
export class ClientScheduleComponent implements OnInit {
  @Output() goBack = new EventEmitter<void>();
  @Input() clientId: number | null = null;
  private clientIdSubscription!: Subscription;

  nav = 0;
  clicked = null;

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

  workouts: Workout[] = [];

  constructor(
    private clientService: ClientService,
    private personalPlanService: PersonalPlanService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.clientIdSubscription = this.clientService.selectedClientId$.subscribe(clientId => {
      this.clientId = clientId;
      if (this.clientId !== null) {
        this.loadWorkouts(this.clientId);
      }
    });

    this.loadCalendar();
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

  loadWorkouts(clientId: number) {
    const token = localStorage.getItem('token') || '';
    this.personalPlanService.getActivePlan(clientId, token).subscribe(
      (plan) => {
        this.workouts = plan.mesocycles.flatMap(mesocycle =>
          mesocycle.microcycles.flatMap(microcycle =>
            microcycle.workouts));
        this.updateDaysWithWorkouts();
      },
      () => {
        this.openSnackBar('Klient nie posiada aktywnego planu');
      }
    )
  }

  updateDaysWithWorkouts() {
    this.days.forEach(day => {
      day.events = this.workouts.filter(workout =>
        workout.dates.some(date => new Date(date).getDate() === day.day &&
          new Date(date).getMonth() === day.month &&
          new Date(date).getFullYear() === day.year)
      );
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

  getEventClass(event: Workout): string {
    return event.individual ?  'non-individual-workout' : 'individual-workout';
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
