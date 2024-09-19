import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Day } from "../../interfaces/Day";
import { Workout } from "../../interfaces/Workout";
import { WorkoutService } from "../../services/workout.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";
import { WorkoutDateChangeDialogComponent } from "../workout-date-change-dialog/workout-date-change-dialog.component";

@Component({
  selector: 'app-workout-day-details',
  templateUrl: './workout-day-details.component.html',
  styleUrl: './workout-day-details.component.scss'
})
export class WorkoutDayDetailsComponent {
  @Output() close = new EventEmitter<void>();
  @Output() update = new EventEmitter<void>();
  @Output() viewWorkoutEvent = new EventEmitter<number>();
  @Input() day!: Day;

  constructor(
    private workoutService: WorkoutService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
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
    this.viewWorkoutEvent.emit(workout.id);
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
    const workoutDate = workout.dates.find(d =>
      new Date(d.date).getDate() === this.day.day &&
      new Date(d.date).getMonth() === this.day.month &&
      new Date(d.date).getFullYear() === this.day.year
    );

    if (workoutDate) {
      const dialogRef = this.dialog.open(WorkoutDateChangeDialogComponent, {
        data: {
          workoutId: workout.id,
          oldDate: workoutDate.date,
          duration: workoutDate.duration
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          const token = localStorage.getItem('token') || '';
          this.workoutService.changeDate(result.workoutId, result.oldDate, result.newDate, result.duration, token).subscribe(
            () => {
              this.onUpdate();
              this.openSnackBar('Data treningu została zmieniona');
            },
            () => {
              this.openSnackBar('Błąd przy zmianie daty treningu');
            }
          );
        }
      });
    } else {
      this.openSnackBar('Nie znaleziono daty treningu dla wybranego dnia');
    }
  }

  getWorkoutTime(workout: Workout): string {
    const workoutDate = workout.dates.find(d =>
      new Date(d.date).getDate() === this.day.day &&
      new Date(d.date).getMonth() === this.day.month &&
      new Date(d.date).getFullYear() === this.day.year
    );

    if (workoutDate) {
      const startTime = new Date(workoutDate.date);
      const endTime = new Date(startTime.getTime() + workoutDate.duration * 60000);
      const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return `${formatTime(startTime)} - ${formatTime(endTime)}`;
    }

    return '';
  }

  private openSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }

  onUpdate() {
    this.update.emit();
  }

  onClose() {
    this.close.emit();
  }
}
