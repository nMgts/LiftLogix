import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss'
})
export class ScheduleComponent {
  @Input() isBoxExpanded = false;
  @Output() closeBox = new EventEmitter<void>();
  protected readonly window = window;

  constructor() {}

  close(event: Event) {
    event.stopPropagation();
    this.closeBox.emit();
  }
}
