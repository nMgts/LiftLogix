import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrl: './tutorial.component.scss'
})
export class TutorialComponent {
  @Input() isBoxExpanded = false;
  @Output() closeBox = new EventEmitter<void>();
  protected readonly window = window;

  constructor() {}

  close(event: Event) {
    event.stopPropagation();
    this.closeBox.emit();
  }
}
