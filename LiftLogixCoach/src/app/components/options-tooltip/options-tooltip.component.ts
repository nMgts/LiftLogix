import { Component, Input } from '@angular/core';
import { SchedulerItem } from "../../interfaces/SchedulerItem";

@Component({
  selector: 'app-options-tooltip',
  templateUrl: './options-tooltip.component.html',
  styleUrl: './options-tooltip.component.scss'
})
export class OptionsTooltipComponent {
  @Input() item: SchedulerItem | null = null;

  viewWorkout() {
    console.log('Podgląd');
  }

  editWorkout() {
    console.log('Edytuj');
  }

  changeWorkoutDate() {
    console.log('Zmień datę');
  }

  changeToIndividual() {
    console.log('Zmień na trening indywidualny');
  }
}
