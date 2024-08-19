import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-client-plan',
  templateUrl: './client-plan.component.html',
  styleUrl: './client-plan.component.scss'
})
export class ClientPlanComponent {
  @Output() goBack = new EventEmitter<void>();

  constructor() {}

  onGoBack() {
    this.goBack.emit();
  }
}
