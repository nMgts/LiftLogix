import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Day } from "../../interfaces/Day";
import { Workout } from "../../interfaces/Workout";
import { WorkoutService } from "../../services/workout.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";
import { WorkoutDateChangeDialogComponent } from "../workout-date-change-dialog/workout-date-change-dialog.component";
import { SchedulerService } from "../../services/scheduler.service";

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
    private schedulerService: SchedulerService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  getWorkoutIndividualStatus(workout: Workout): boolean {
    const workoutDate = this.getDate(workout);
    return workoutDate ? workoutDate.individual : false;
  }

  viewWorkout(workout: Workout) {
    this.viewWorkoutEvent.emit(workout.id);
  }

  toggleWorkoutType(workout: Workout) {
    const token = localStorage.getItem('token') || '';
    const workoutDate = this.getDate(workout);

    if (workoutDate) {
      this.workoutService.toggleIndividual(workout.id, workoutDate.date, token).subscribe(
        () => {
          this.day.events = this.day.events.map(w =>
            w.id === workout.id ? {
              ...w,
              dates: w.dates.map(d =>
                d.date === workoutDate.date ? { ...d, individual: !d.individual } : d
              )
            } : w
          );
          this.reloadScheduler();
          this.openSnackBar('Status treningu został zmieniony');
        },
        (error) => {
          if (error.status === 409) {
            this.openSnackBar('Konflikt: W podanym przedziale czasowym posiadasz już trening personalny.');
          } else {
            this.openSnackBar('Błąd przy zmianie statusu treningu');
          }
        }
      );
    } else {
      this.openSnackBar('Nie znaleziono daty treningu dla wybranego dnia');
    }
  }

  changeWorkoutDate(workout: Workout) {
    const workoutDate = this.getDate(workout);

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
              this.reloadScheduler();
              this.openSnackBar('Data treningu została zmieniona');
            },
            (error) => {
              if (error.status === 409) {
                this.openSnackBar('Konflikt: W podanym przedziale czasowym posiadasz już trening personalny.');
              } else {
                this.openSnackBar('Błąd przy zmianie daty treningu');
              }
            }
          );
        }
      });
    } else {
      this.openSnackBar('Nie znaleziono daty treningu dla wybranego dnia');
    }
  }

  getWorkoutTime(workout: Workout): string {
    const workoutDate = this.getDate(workout);

    if (workoutDate) {
      const startTime = new Date(workoutDate.date);
      const endTime = new Date(startTime.getTime() + workoutDate.duration * 60000);
      const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return `${formatTime(startTime)} - ${formatTime(endTime)}`;
    }

    return '';
  }

  private getDate(workout: Workout) {
    return workout.dates.find(d =>
      new Date(d.date).getDate() === this.day.day &&
      new Date(d.date).getMonth() === this.day.month &&
      new Date(d.date).getFullYear() === this.day.year
    );
  }

  private reloadScheduler() {
    this.schedulerService.triggerLoadScheduler();
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
