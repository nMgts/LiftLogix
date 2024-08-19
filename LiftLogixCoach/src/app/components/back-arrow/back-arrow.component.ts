import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-back-arrow',
  templateUrl: './back-arrow.component.html',
  styleUrl: './back-arrow.component.scss'
})
export class BackArrowComponent {
  @Output() goBack = new EventEmitter<void>();

  onBackClick() {
    this.goBack.emit();
  }
}
