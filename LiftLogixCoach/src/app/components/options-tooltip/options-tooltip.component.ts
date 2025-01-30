import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SchedulerItem } from "../../interfaces/SchedulerItem";

@Component({
  selector: 'app-options-tooltip',
  templateUrl: './options-tooltip.component.html',
  styleUrl: './options-tooltip.component.scss'
})
export class OptionsTooltipComponent {
  @Input() item: SchedulerItem | null = null;
  @Output() editWorkoutEvent = new EventEmitter<SchedulerItem>();
  @Output() viewWorkoutEvent = new EventEmitter<SchedulerItem>();
  @Output() changeWorkoutDateEvent = new EventEmitter<SchedulerItem>();
  @Output() changeToIndividualEvent = new EventEmitter<SchedulerItem>();

  viewWorkout() {
    if (this.item) {
      this.viewWorkoutEvent.emit(this.item);
    }
  }

  editWorkout() {
    if (this.item) {
      this.editWorkoutEvent.emit(this.item);
    }
  }

  changeWorkoutDate() {
    if (this.item) {
      this.changeWorkoutDateEvent.emit(this.item);
    }
  }

  changeToIndividual() {
    if (this.item) {
      this.changeToIndividualEvent.emit(this.item);
    }
  }
}
