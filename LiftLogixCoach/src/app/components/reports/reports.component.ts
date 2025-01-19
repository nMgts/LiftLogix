import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {
  @Input() isBoxExpanded = false;
  @Output() closeBox = new EventEmitter<void>();
  protected readonly window = window;

  constructor() {}

  close(event: Event) {
    event.stopPropagation();
    this.closeBox.emit();
  }
}
