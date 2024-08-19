import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-client-hours',
  templateUrl: './client-hours.component.html',
  styleUrl: './client-hours.component.scss'
})
export class ClientHoursComponent {
  @Output() goBack = new EventEmitter<void>();

  constructor() {}

  onGoBack() {
    this.goBack.emit();
  }
}
