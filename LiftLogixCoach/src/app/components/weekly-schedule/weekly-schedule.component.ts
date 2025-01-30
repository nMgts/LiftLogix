import { Component, HostListener, Input, OnInit, ViewContainerRef } from '@angular/core';
import { addDays, format, startOfWeek } from "date-fns";
import { SchedulerService } from "../../services/scheduler.service";
import { SchedulerItem } from "../../interfaces/SchedulerItem";
import { CoachSchedulerService } from "../../services/coach-scheduler.service";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { OptionsTooltipComponent } from "../options-tooltip/options-tooltip.component";
import { PersonalPlan } from "../../interfaces/PersonalPlan";
import { PersonalPlanService } from "../../services/personal-plan.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import {WorkoutDateChangeDialogComponent} from "../workout-date-change-dialog/workout-date-change-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {WorkoutService} from "../../services/workout.service";

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

  protected readonly window = window;
  private overlayRef: OverlayRef | null = null;

  workoutId: number = 0;
  plan: PersonalPlan | null = null;
  isEditingWorkout: boolean = false;

  protected readonly parseFloat = parseFloat;
  protected readonly console = console;

  get daysOfWeek() {
    return this.isBoxExpanded
      ? window.innerWidth > 800 ?
      ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'] : ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd']
      : ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
  }

  constructor(
    private coachSchedulerService: CoachSchedulerService,
    private schedulerService: SchedulerService,
    private personalPlanService: PersonalPlanService,
    private workoutService: WorkoutService,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
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

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.generateHours();
  }

  loadSchedulerData() {
    const token = localStorage.getItem('token') || '';
    this.coachSchedulerService.getScheduler(token).subscribe(
      (scheduler) => {
        this.schedulerItems = scheduler.schedulerItems;
      },
      (error) => {
        console.error('Scheduler not found', error);
      }
    );
  }

  showOptionsTooltip(item: SchedulerItem, event: MouseEvent) {
    event.stopPropagation();
    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(event.target as HTMLElement)
      .withPositions([{ originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top' }]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop'
    });

    const tooltipPortal = new ComponentPortal(OptionsTooltipComponent, this.viewContainerRef);
    const tooltipRef = this.overlayRef.attach(tooltipPortal);

    tooltipRef.instance.item = item;

    tooltipRef.instance.viewWorkoutEvent.subscribe((item: SchedulerItem) => {
      this.viewWorkout(item.workoutUnitId);
      this.hideOptionsTooltip();
    });

    tooltipRef.instance.editWorkoutEvent.subscribe((item: SchedulerItem) => {
      this.editWorkout(item.workoutUnitId);
      this.hideOptionsTooltip();
    });

    tooltipRef.instance.changeWorkoutDateEvent.subscribe((item: SchedulerItem) => {
      this.changeWorkoutDate(item.workoutUnitId);
      this.hideOptionsTooltip();
    });

    tooltipRef.instance.changeToIndividualEvent.subscribe((item: SchedulerItem) => {
      this.changeWorkoutToIndividual(item.workoutUnitId);
      this.hideOptionsTooltip();
    });

    this.overlayRef.backdropClick().subscribe(() => this.hideOptionsTooltip());
  }

  hideOptionsTooltip() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
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

    const height = window.innerHeight;
    const width = window.innerWidth;
    let hoursToShow = 12;
    if (height > 780 && width > 1023) {
      hoursToShow = 14;
    }
    if (height > 849 && width > 1023) {
      hoursToShow = 16;
    }
    if (height > 919 && width > 1023) {
      hoursToShow = 18;
    }
    if (height > 989 && width > 1023) {
      hoursToShow = 20;
    }
    if (height > 1059 && width > 1023) {
      hoursToShow = 22;
    }
    if (height > 1129 && width > 1023) {
      hoursToShow = 24;
    }

    let endHour = currentHour + hoursToShow;

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

  viewWorkout(workoutId: number) {
    this.workoutId = workoutId;
    const token = localStorage.getItem('token') || '';
    this.personalPlanService.getPersonalPlanByWorkout(workoutId, token).subscribe(
      (plan) => {
        this.plan = plan;
      },
      () => {
        this.openSnackBar('Nie udało się wczytać planu');
      }
    );
  }

  editWorkout(workoutId: number) {
    this.workoutId = workoutId;
    this.isEditingWorkout = true;
  }

  changeWorkoutDate(workoutId: number) {
    const token = localStorage.getItem('token') || '';
    this.workoutService.getWorkout(workoutId, token).subscribe(
      workout => {
        const dialogRef = this.dialog.open(WorkoutDateChangeDialogComponent, {
          data: {
            workoutId: workout.id,
            oldDate: workout.date,
            duration: workout.duration
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            const token = localStorage.getItem('token') || '';
            this.workoutService.changeDate(result.workoutId, result.newDate, result.duration, token).subscribe(
              () => {
                this.loadSchedulerData();
                this.openSnackBar('Data treningu została zmieniona');
              },
              (error) => {
                if (error.status === 409) {
                  this.openSnackBar('Konflikt: W podanym przedziale czasowym posiadasz już trening personalny lub klient ma zapisany inny trening');
                } else {
                  this.openSnackBar('Błąd przy zmianie daty treningu');
                }
              }
            );
          }
        });
      }
    );
  }

  changeWorkoutToIndividual(workoutId: number) {
    const token = localStorage.getItem('token') || '';
    this.workoutService.toggleIndividual(workoutId, token).subscribe(
      () => {
        this.loadSchedulerData();
        this.openSnackBar('Trening został zmieniony na indywidualny');
      }, error => {
        if (error.status === 409) {
          this.openSnackBar('Konflikt: W podanym przedziale czasowym posiadasz już trening personalny.');
        } else {
          this.openSnackBar('Błąd przy zmianie statusu treningu');
        }
      }
    )
  }

  private openSnackBar(message: string): void {
    this.snackBar.open(message, 'Zamknij', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }

  goBack() {
    this.workoutId = 0;
    this.isEditingWorkout = false;
  }
}
