import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from "rxjs";
import { PersonalPlan } from "../../interfaces/PersonalPlan";
import { ClientService } from "../../services/client.service";
import { PersonalPlanService } from "../../services/personal-plan.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { BasicPersonalPlan } from "../../interfaces/BasicPersonalPlan";

@Component({
  selector: 'app-client-plan',
  templateUrl: './client-plan.component.html',
  styleUrl: './client-plan.component.scss'
})
export class ClientPlanComponent implements OnInit, OnDestroy {
  @Input() clientId: number | null = null;
  @Input() isFullScreen: boolean = false;
  @Output() goBack = new EventEmitter<void>();
  private clientIdSubscription!: Subscription;

  plan: PersonalPlan | null = null;
  plans: BasicPersonalPlan[] = [];
  notFound: boolean = false;
  choice: string = '';

  selectedOldPlanId: number = 0;

  constructor(
    private clientService: ClientService,
    private personalPlanService: PersonalPlanService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.clientIdSubscription = this.clientService.selectedClientId$.subscribe(clientId => {
      this.clientId = clientId;
      if (this.clientId !== null) {
        this.loadPlan(this.clientId);
        this.loadClientPlans(this.clientId);
      }
    });
  }

  ngOnDestroy() {
    this.clientIdSubscription.unsubscribe();
  }

  loadPlan(clientId: number) {
    const token = localStorage.getItem('token') || '';
    this.personalPlanService.getActivePlan(clientId, token).subscribe({
      next: (plan) => {
        this.plan = plan;
        this.notFound = false;
      },
      error: (error) => {
        if (error.status === 404) {
          this.notFound = true;
        } else {
          console.error('Error during checking client active plans');
        }
      }
    })
  }

  loadClientPlans(clientId: number) {
    const token = localStorage.getItem('token') || '';
    this.personalPlanService.getClientPlans(clientId, token).subscribe({
      next: (plans) => {
        this.plans = plans.filter(plan => !plan.active);
      },
      error: () => {
        this.openSnackBar('Nie udało się załadować nieaktywnych planów');
      }
    })
  }

  deletePlan(planId: number) {
    const token = localStorage.getItem('token') || '';
    this.personalPlanService.deletePlan(planId, token).subscribe(
      () => {
        this.plans = this.plans.filter(plan => plan.id !== planId);
      },
      () => {
        this.openSnackBar('Nie udało się usunąć planu');
      }
    )
  }

  createNewPlan() {
    this.choice = 'create';
  }

  selectExistingPlan() {
    this.choice = 'select';
  }

  viewPersonalPlan() {
    this.choice = 'view';
  }

  editPersonalPlan() {
    this.choice = 'update';
  }

  viewOldPlan(planId: number) {
    this.choice = 'viewOld'
    this.selectedOldPlanId = planId;
  }

  deactivatePersonalPlan() {
    const token = localStorage.getItem('token') || '';
    const id = this.plan?.id;

    if (id) {
      this.personalPlanService.deactivatePlan(id, token).subscribe(
        () => {
          this.plan = null;
          this.notFound = true;
          if (this.clientId) {
            this.loadClientPlans(this.clientId);
          }
        },
        () => {
          this.openSnackBar('Nie udało się zakończyć planu');
        }
      )
    }
  }

  onCancel() {
    this.choice = '';
    this.selectedOldPlanId = 0;
    if (this.clientId) {
      this.loadPlan(this.clientId);
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

  onGoBack() {
    this.goBack.emit();
  }

  private openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }
}
