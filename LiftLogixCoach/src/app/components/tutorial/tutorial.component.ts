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

  sections = [
    { id: 'submissions', name: 'Zgłoszenia' },
    { id: 'exercises', name: 'Ćwiczenia i biblioteka ćwiczeń' },
    { id: 'clients', name: 'Zarządzanie klientami' },
    { id: 'plans', name: 'Plany treningowe' },
    { id: 'reports', name: 'Raporty' },
    { id: 'schedule', name: 'Harmonogram trenera' }
  ];

  selectedSection: string | null = null;

  constructor() {}

  selectSection(sectionId: string) {
    this.selectedSection = sectionId;
  }

  goBack() {
    this.selectedSection = null;
  }

  close(event: Event) {
    event.stopPropagation();
    this.closeBox.emit();
  }
}
