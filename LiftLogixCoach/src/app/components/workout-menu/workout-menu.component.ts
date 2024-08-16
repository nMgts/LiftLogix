import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-workout-menu',
  templateUrl: './workout-menu.component.html',
  styleUrl: './workout-menu.component.scss'
})
export class WorkoutMenuComponent {
  @Input() isBoxExpanded = false;
  @Output() closeBox = new EventEmitter<void>();
  protected readonly window = window;
  selectedComponent: string | null = null;

  constructor() {}

  selectComponent(component: string) {
    this.selectedComponent = component;
  }

  goBack() {
    this.selectedComponent = null;
  }

  close(event: Event) {
    event.stopPropagation();
    this.closeBox.emit();
  }
}
