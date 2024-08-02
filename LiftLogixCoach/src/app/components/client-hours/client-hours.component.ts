import { Component } from '@angular/core';
import { ClientsComponent } from "../clients/clients.component";

@Component({
  selector: 'app-client-hours',
  templateUrl: './client-hours.component.html',
  styleUrl: './client-hours.component.scss'
})
export class ClientHoursComponent {
  constructor(private clientsComponent: ClientsComponent) {}

  goBack(event: Event) {
    event.stopPropagation();
    this.clientsComponent.clearSelectedComponent();
  }
}
