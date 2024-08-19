import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { BasicPlan } from "../../interfaces/BasicPlan";
import { PlanService } from "../../services/plan.service";
import { PageEvent } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: 'app-workout-library-private',
  templateUrl: './workout-library-private.component.html',
  styleUrl: './workout-library-private.component.scss'
})
export class WorkoutLibraryPrivateComponent implements OnInit {
  @Output() goBack = new EventEmitter<void>();

  plans: BasicPlan[] = [];
  filteredPlans: BasicPlan[] = [];
  displayedPlans: BasicPlan[] = [];
  searchTerm: string = '';
  page: number = 0;
  pageSize: number = 10;

  selectedPlan: number | null = null;

  protected readonly window = window;

  constructor(private planService: PlanService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans() {
    const token = localStorage.getItem('token') || '';
    this.planService.getMyPlans(token).subscribe(plans => {
      this.plans = plans;
      this.updateFilteredPlans();
    });
  }

  updateFilteredPlans(): void {
    this.filteredPlans = this.plans
      .filter(plan => plan.name.toLowerCase().includes(this.searchTerm.toLowerCase()));

    this.displayPlans();
  }

  displayPlans() {
    const startIndex = this.page * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedPlans = this.filteredPlans.slice(startIndex, endIndex);
  }

  previewPlan(id: number) {

  }

  editPlan(id: number) {
    this.selectedPlan = id;
  }

  onCancel() {
    this.selectedPlan = null;
    this.loadPlans();
  }

  downloadPlan(id: number) {

  }

  deletePlan(id: number) {
    const token = localStorage.getItem('token') || '';
    this.planService.deletePlan(id, token).subscribe(
      () => {
      this.loadPlans();
    },
      (error) => {
      this.openSnackBar('Wystąpił błąd');
    });
  }

  onSearchChange(): void {
    this.page = 0;
    this.updateFilteredPlans();
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateFilteredPlans();
  }

  getPlanDuration(length: number): string {
    const weeks = Math.floor(length / 7);
    const days = length % 7;

    if (weeks === 0 && days < 7) {
      return '<1 tydz.';
    } else if (weeks === 1 && days === 0) {
      return `${weeks} tydz.`;
    } else if (weeks === 1 && days > 0 && days < 4) {
      return `~${weeks} tydz.`;
    } else if (weeks === 1 && days > 3) {
      return `~${weeks + 1} tyg.`
    } else if (weeks > 1 && days == 0) {
      return `${weeks} tyg.`;
    } else if (weeks > 1 && days > 0 && days < 4){
      return `~${weeks} tyg.`;
    } else if (weeks > 1 && days > 3) {
      return `~${weeks + 1} tyg.`;
    } else return '';
  }

  private openSnackBar(message: string) {
    this.snackBar.open(message, 'Zamknij', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }

  onGoBack() {
    this.goBack.emit();
  }
}
