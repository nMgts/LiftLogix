import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BasicPlan } from "../../interfaces/BasicPlan";
import { PlanService } from "../../services/plan.service";
import { PageEvent } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: 'app-workout-library-public',
  templateUrl: './workout-library-public.component.html',
  styleUrl: './workout-library-public.component.scss'
})
export class WorkoutLibraryPublicComponent implements OnInit {
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
    this.planService.getPublicPlans(token).subscribe(plans => {
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
    this.selectedPlan = id;
  }

  addToMyPlans(id: number) {
    const token = localStorage.getItem('token') || '';
    this.planService.addToMyPlans(id, token).subscribe(
      () => {
        this.openSnackBar('Plan został dodany do prywatnej bibliotek')
      },
      (error) => {
        if (error.status === 409) {
          this.openSnackBar('Ten plan jest Twojego autorstwa')
        } else {
          this.openSnackBar('Wystąpił błąd');
        }
      });
  }

  downloadPlan(id: number) {

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

  onCancel() {
    this.selectedPlan = null;
  }

  onGoBack() {
    this.goBack.emit();
  }
}
