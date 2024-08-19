import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-client-diet',
  templateUrl: './client-diet.component.html',
  styleUrl: './client-diet.component.scss'
})
export class ClientDietComponent {
  @Output() goBack = new EventEmitter<void>();

  constructor() {}

  onGoBack() {
    this.goBack.emit();
  }
}
