import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Day } from "../../interfaces/Day";
import { WorkoutService } from "../../services/workout.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";
import { WorkoutDateChangeDialogComponent } from "../workout-date-change-dialog/workout-date-change-dialog.component";
import { SchedulerService } from "../../services/scheduler.service";
import { WorkoutUnit } from "../../interfaces/WorkoutUnit";

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

  isToggleBlocked: boolean = false;

  constructor(
    private workoutService: WorkoutService,
    private schedulerService: SchedulerService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  viewWorkout(workout: WorkoutUnit) {
    this.viewWorkoutEvent.emit(workout.id);
  }

  toggleWorkoutType(workout: WorkoutUnit) {
    if (this.isToggleBlocked) return;

    const token = localStorage.getItem('token') || '';
    const previousStatus = workout.individual;

    workout.individual = !workout.individual;
    this.isToggleBlocked = true;

    this.workoutService.toggleIndividual(workout.id, token).subscribe(
      () => {
        this.reloadScheduler();
        this.openSnackBar('Status treningu został zmieniony');
        this.isToggleBlocked = false;
      },
      (error) => {
        workout.individual = previousStatus;
        this.isToggleBlocked = false;

        if (error.status === 409) {
          this.openSnackBar('Konflikt: W podanym przedziale czasowym posiadasz już trening personalny.');
        } else {
          this.openSnackBar('Błąd przy zmianie statusu treningu');
        }
      });
  }

  changeWorkoutDate(workout: WorkoutUnit) {
    const dialogRef = this.dialog.open(WorkoutDateChangeDialogComponent, {
      data: {
        workoutId: workout.id,
        oldDate: workout.date,
        duration: workout.duration
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const token = localStorage.getItem('token') || '';
        this.workoutService.changeDate(result.workoutId, result.newDate, result.duration, token).subscribe(
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
  }

  getWorkoutTime(workout: WorkoutUnit): string {
    const startTime = new Date(workout.date);
    const endTime = new Date(startTime.getTime() + workout.duration * 60000);
    const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
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
