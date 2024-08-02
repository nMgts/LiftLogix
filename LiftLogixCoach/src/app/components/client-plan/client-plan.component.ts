import { Component } from '@angular/core';
import { ClientsComponent } from "../clients/clients.component";

@Component({
  selector: 'app-client-plan',
  templateUrl: './client-plan.component.html',
  styleUrl: './client-plan.component.scss'
})
export class ClientPlanComponent {
  constructor(private clientsComponent: ClientsComponent) {}

  goBack(event: Event) {
    event.stopPropagation();
    this.clientsComponent.clearSelectedComponent();
  }
}
