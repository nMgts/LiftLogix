import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Day } from "../../interfaces/Day";
import { Workout } from "../../interfaces/Workout";

@Component({
  selector: 'app-workout-day-details',
  templateUrl: './workout-day-details.component.html',
  styleUrl: './workout-day-details.component.scss'
})
export class WorkoutDayDetailsComponent {
  @Output() close = new EventEmitter<void>();
  @Input() day!: Day;

  viewWorkout(workout: Workout) {

  }

  toggleWorkoutType(workout: Workout) {

  }

  changeWorkoutDate(workout: Workout) {

  }

  onClose() {
    this.close.emit();
  }
}
