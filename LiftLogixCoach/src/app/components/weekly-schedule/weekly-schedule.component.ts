import {Component, Input, OnChanges} from '@angular/core';

@Component({
  selector: 'app-weekly-schedule',
  templateUrl: './weekly-schedule.component.html',
  styleUrl: './weekly-schedule.component.scss'
})
export class WeeklyScheduleComponent implements OnChanges {
  @Input() isBoxExpanded = false;
  hours: string[] = [];

  get daysOfWeek() {
    return this.isBoxExpanded
      ? ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela']
      : ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
  }

  constructor() {
    this.generateHours();
  }

  ngOnChanges(): void {
    this.generateHours();
  }

  generateHours() {
    if (this.isBoxExpanded) {
      this.generateFullHours();
    } else {
      this.generateLimitedHours();
    }
  }

  generateFullHours() {
    this.hours = [];
    for (let i = 0; i < 24; i += 2) {
      this.hours.push(`${this.padZero(i)}:00 - ${this.padZero(i + 2)}:00`);
    }
  }

  generateLimitedHours() {
    this.hours = [];
    const now = new Date();
    let currentHour = now.getHours();

    if (currentHour % 2 !== 0) {
      currentHour--;
    }

    let endHour = currentHour + 12;

    if (endHour >= 24) {
      currentHour = currentHour - endHour % 24;
      endHour = endHour - endHour % 24;
    }

    while (currentHour < endHour) {
      const nextHour = currentHour + 2;
      this.hours.push(`${this.padZero(currentHour)}:00 - ${this.padZero(nextHour)}:00`);
      currentHour = nextHour;
    }
  }

  padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }
}
