import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
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
  @Input() personalPlan = false;
  @Input() clientId: number | null = null;
  @Input() isFullScreen = false;

  plans: BasicPlan[] = [];
  filteredPlans: BasicPlan[] = [];
  displayedPlans: BasicPlan[] = [];
  searchTerm: string = '';
  page: number = 0;
  pageSize: number = 10;

  selectedPlan: number | null = null;
  viewPlan: number | null = null;
  editingPlan: number | null = null;
  newName: string = '';

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
    this.viewPlan = id;
  }

  editPlan(id: number) {
    this.selectedPlan = id;
  }

  startEdit(plan: BasicPlan, event: Event) {
    event.stopPropagation();
    this.editingPlan = plan.id;
  }

  cancelEdit() {
    this.editingPlan = null;
  }

  saveEdit(plan: BasicPlan, event: Event) {
    event.stopPropagation();
    if (this.newName !== plan.name && this.newName !== '') {
      const token = localStorage.getItem('token') || '';
      this.planService.renamePlan(plan.id , this.newName, token).subscribe(
        () => {
          this.editingPlan = null;
          plan.name = this.newName;
          this.openSnackBar('Nazwa planu została zmieniona');
        },
        () => this.openSnackBar('Wystąpił błąd podczas zmiany nazwy planu')
      );
    } else {
      this.editingPlan = null;
    }
  }

  changeVisibility(plan: BasicPlan, isPublic: boolean) {
    const token = localStorage.getItem('token') || '';
    this.planService.changePlanVisibility(plan.id, isPublic, token).subscribe(
      () => {
        this.openSnackBar(`Plan został ${isPublic ? 'ustawiony jako publiczny' : 'ustawiony jako prywatny'}`);
        plan.public = isPublic;
      },
      () => this.openSnackBar('Wystąpił błąd podczas zmiany widoczności planu')
    );
  }

  onCancel() {
    this.selectedPlan = null;
    this.viewPlan = null;
    this.loadPlans();
  }

  onSuccess() {
    this.onGoBack();
  }

  downloadPlan(id: number) {
    const token = localStorage.getItem('token') || '';
    this.planService.exportPlanToExcel(id, token).subscribe({
      next: () => console.log('File exported successfully'),
      error: (err) => {
        console.error('File export failed', err);
        this.openSnackBar('Wystąpił błąd');
      }
    });
  }

  deletePlan(id: number) {
    const token = localStorage.getItem('token') || '';
    this.planService.deletePlan(id, token).subscribe(
      () => {
      this.loadPlans();
    },
      () => {
      this.openSnackBar('Wystąpił błąd');
    });
  }

  duplicatePlan(id: number) {
    const token = localStorage.getItem('token') || '';
    this.planService.duplicatePlan(id, token).subscribe({
      next: () => this.loadPlans(),
      error: (err) => console.error('Error during duplicating plan', err)
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

  truncateText(text: string): string {
    if (text.length > 30) {
      if (window.innerWidth < 601 && window.innerWidth > 430) return text.substring(0, 20) + '...';
      if (window.innerWidth < 431) return text.substring(0, 15) + '...';
      if (window.innerWidth < 381) return text.substring(0, 10) + '...';
      return text.substring(0, 30) + '...';
    } else {
      return text;
    }
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
