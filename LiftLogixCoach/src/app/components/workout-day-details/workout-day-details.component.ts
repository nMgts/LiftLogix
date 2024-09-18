import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Day } from "../../interfaces/Day";
import { Workout } from "../../interfaces/Workout";
import { WorkoutService } from "../../services/workout.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-workout-day-details',
  templateUrl: './workout-day-details.component.html',
  styleUrl: './workout-day-details.component.scss'
})
export class WorkoutDayDetailsComponent {
  @Output() close = new EventEmitter<void>();
  @Input() day!: Day;

  constructor(
    private workoutService: WorkoutService,
    private snackBar: MatSnackBar
  ) {}

  getWorkoutIndividualStatus(workout: Workout): boolean {
    const workoutDate = workout.dates.find(d =>
      new Date(d.date).getDate() === this.day.day &&
      new Date(d.date).getMonth() === this.day.month &&
      new Date(d.date).getFullYear() === this.day.year
    );
    return workoutDate ? workoutDate.individual : false;
  }

  viewWorkout(workout: Workout) {

  }

  toggleWorkoutType(workout: Workout) {
    const token = localStorage.getItem('token') || '';
    const date = workout.dates.find(d =>
      new Date(d.date).getDate() === this.day.day &&
      new Date(d.date).getMonth() === this.day.month &&
      new Date(d.date).getFullYear() === this.day.year
    );

    if (date) {
      this.workoutService.toggleIndividual(workout.id, date.date, token).subscribe(
        () => {
          this.day.events = this.day.events.map(w =>
            w.id === workout.id ? {
              ...w,
              dates: w.dates.map(d =>
                d.date === date.date ? { ...d, individual: !d.individual } : d
              )
            } : w
          );

          // Notify user of success
          this.openSnackBar('Status treningu został zmieniony');
        },
        () => {
          this.openSnackBar('Błąd przy zmianie statusu treningu');
        }
      );
    } else {
      this.openSnackBar('Nie znaleziono daty treningu dla wybranego dnia');
    }
  }


  changeWorkoutDate(workout: Workout) {

  }

  private openSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }

  onClose() {
    this.close.emit();
  }
}
