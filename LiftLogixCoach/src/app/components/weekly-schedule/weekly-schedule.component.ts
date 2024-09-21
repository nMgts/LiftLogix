import { Component, Input, OnInit } from '@angular/core';
import { addDays, format, startOfWeek } from "date-fns";
import { SchedulerItem } from "../../interfaces/SchedulerItem";
import { CoachSchedulerService } from "../../services/coach-scheduler.service";
import {SchedulerService} from "../../services/scheduler.service";

@Component({
  selector: 'app-weekly-schedule',
  templateUrl: './weekly-schedule.component.html',
  styleUrl: './weekly-schedule.component.scss'
})
export class WeeklyScheduleComponent implements OnInit {
  @Input() isBoxExpanded = false;

  currentWeekStart: Date = startOfWeek(new Date(), { weekStartsOn: 1 });
  displayWeekRange: string = '';
  hours: string[] = [];
  weekDays: Date[] = [];

  schedulerItems: SchedulerItem[] = [];

  get daysOfWeek() {
    return this.isBoxExpanded
      ? ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela']
      : ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
  }

  constructor(
    private coachSchedulerService: CoachSchedulerService,
    private schedulerService: SchedulerService
  ) {}

  ngOnInit(): void {
    this.generateHours();
    this.updateWeekRange();
    this.updateWeekDays();
    this.schedulerService.loadScheduler$.subscribe(() => {
      this.loadSchedulerData();
    });
    this.schedulerService.triggerLoadScheduler();
  }

  loadSchedulerData() {
    const token = localStorage.getItem('token') || '';
    this.coachSchedulerService.getScheduler(token).subscribe(
      (scheduler) => {
        this.schedulerItems = scheduler.schedulerItems;
        console.log(this.schedulerItems)
      },
      (error) => {
        console.error('Scheduler not found', error);
      }
    );
  }

  prevWeek() {
    this.currentWeekStart = addDays(this.currentWeekStart, -7);
    this.updateWeekRange();
    this.updateWeekDays();
  }

  nextWeek() {
    this.currentWeekStart = addDays(this.currentWeekStart, 7);
    this.updateWeekRange();
    this.updateWeekDays();
  }

  updateWeekRange() {
    const weekStart = this.currentWeekStart;
    const weekEnd = addDays(weekStart, 6);
    this.displayWeekRange = `${format(weekStart, 'dd.MM.yyyy')} - ${format(weekEnd, 'dd.MM.yyyy')}`;
  }

  updateWeekDays() {
    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      this.weekDays.push(addDays(this.currentWeekStart, i));
    }
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

  isItemInSlot(item: SchedulerItem, dayDate: Date, hour: string): boolean {
    const itemStartDate = new Date(item.startDate);
    const itemEndDate = new Date(item.endDate);

    const [slotStart, slotEnd] = hour.split(' - ').map(h => {
      const [hours] = h.split(':');
      const newDate = new Date(dayDate);
      newDate.setHours(parseInt(hours), 0, 0);
      return new Date(newDate);
    });

    return (itemStartDate < slotEnd && itemEndDate > slotStart);
  }

  isFirstPossibleSlot(item: SchedulerItem, dayDate: Date, hourSlot: string): boolean {
    const itemStartDate = new Date(item.startDate);
    const itemEndDate = new Date(item.endDate);

    const [slotStartHour, slotEndHour] = hourSlot.split(' - ').map(h => {
      const [hours] = h.split(':');
      return parseInt(hours, 10);
    });

    let itemStartHour = itemStartDate.getHours() + itemStartDate.getMinutes() / 60;
    const itemEndHour = itemEndDate.getHours() + itemEndDate.getMinutes() / 60;

    const firstPossibleHour = parseInt(this.hours[0].split(' - ')[0].split(':')[0], 10);

    if (itemStartHour < firstPossibleHour) {
      const difference = firstPossibleHour - itemStartHour;
      itemStartHour += difference;
    }

    if (itemStartHour > itemEndHour && !this.isSameDay(itemStartDate, dayDate)) {
      itemStartHour = firstPossibleHour;
    }

    return itemStartHour >= slotStartHour && itemStartHour < slotEndHour;
  }

  getItemSlotTop(item: SchedulerItem, dayDate: Date, hourSlot: string): string {
    const [startHour] = hourSlot.split(' - ').map(h => parseInt(h, 10));
    const itemStartDate = new Date(item.startDate);

    const itemStartHour = itemStartDate.getHours();
    const itemStartMinutes = itemStartDate.getMinutes();

    const hourHeight = 26.5;
    const minuteOffset = (itemStartMinutes / 60) * hourHeight;
    let offset = (itemStartHour - startHour) * hourHeight + minuteOffset;

    if (itemStartHour < startHour) {
      offset = 0;
    }

    if (!this.isSameDay(itemStartDate, dayDate)) {
      offset = 0;
    }

    return `${offset}px`;
  }

  getTotalSlotHeight(item: SchedulerItem, dayDate: Date): string {
    const itemStartDate = new Date(item.startDate);
    const itemEndDate = new Date(item.endDate);

    const [firstSlotStartHour] = this.hours[0].split(' - ').map(h =>
      parseInt(h.split(':')[0], 10));
    const [_, lastSlotEndHour] = this.hours[this.hours.length - 1].split(' - ').map(h => {
      return parseInt(h.split(':')[0], 10);
    });

    const itemStartHour = Math.max(itemStartDate.getHours() + itemStartDate.getMinutes() / 60, firstSlotStartHour);
    const itemEndHour = itemEndDate.getHours() + itemEndDate.getMinutes() / 60;

    let totalHours = itemEndHour - itemStartHour;

    if (itemEndHour > lastSlotEndHour) {
      const difference = itemEndHour - lastSlotEndHour;
      totalHours -= difference;
    }

    if (itemStartHour > itemEndHour) {
      this.isSameDay(itemStartDate, dayDate) ? totalHours = 24 - itemStartHour : totalHours = itemEndHour;
    }

    const hourHeight = 26.5;
    return `${totalHours * hourHeight}px`;
  }

  private isSameDay(itemDate: Date, dayDate: Date): boolean {
    return itemDate.getDate() === dayDate.getDate() &&
      itemDate.getMonth() === dayDate.getMonth() &&
      itemDate.getFullYear() === dayDate.getFullYear();
  }

  protected readonly parseFloat = parseFloat;
}
