import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subscription} from "rxjs";
import {PersonalPlan} from "../../interfaces/PersonalPlan";
import {ClientService} from "../../services/client.service";
import {PersonalPlanService} from "../../services/personal-plan.service";

@Component({
  selector: 'app-client-plan',
  templateUrl: './client-plan.component.html',
  styleUrl: './client-plan.component.scss'
})
export class ClientPlanComponent implements OnInit, OnDestroy {
  @Input() clientId: number | null = null;
  @Output() goBack = new EventEmitter<void>();
  private clientIdSubscription!: Subscription;

  plan: PersonalPlan | null = null;
  notFound: boolean = false;
  choice: string = '';

  constructor(
    private clientService: ClientService,
    private personalPlanService: PersonalPlanService
  ) {}

  ngOnInit() {
    this.clientIdSubscription = this.clientService.selectedClientId$.subscribe(clientId => {
      this.clientId = clientId;
      if (this.clientId !== null) {
        this.loadPlan(this.clientId);
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

  createNewPlan() {
    this.choice = 'create';
  }

  selectExistingPlan() {
    this.choice = 'select';
  }

  onCancel() {
    this.choice = '';
  }

  onGoBack() {
    this.goBack.emit();
  }
}
