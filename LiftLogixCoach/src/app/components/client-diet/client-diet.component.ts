import { Component } from '@angular/core';
import { ClientsComponent } from "../clients/clients.component";

@Component({
  selector: 'app-client-diet',
  templateUrl: './client-diet.component.html',
  styleUrl: './client-diet.component.scss'
})
export class ClientDietComponent {
  constructor(private clientsComponent: ClientsComponent) {}

  goBack(event: Event) {
    event.stopPropagation();
    this.clientsComponent.clearSelectedComponent();
  }
}
