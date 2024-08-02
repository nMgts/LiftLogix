import { Component } from '@angular/core';
import { ClientsComponent } from "../clients/clients.component";

@Component({
  selector: 'app-client-profile',
  templateUrl: './client-profile.component.html',
  styleUrl: './client-profile.component.scss'
})
export class ClientProfileComponent {
  constructor(private clientsComponent: ClientsComponent) {}

  goBack(event: Event) {
    event.stopPropagation();
    this.clientsComponent.clearSelectedComponent();
  }
}
