import { Component, HostListener, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { Client } from "../../interfaces/Client";
import { ClientService } from "../../services/client.service";

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss'
})
export class ClientsComponent implements OnInit{
  @Input() isBoxExpanded = false;
  clientsQuantity: number = 0;
  protected readonly window = window;
  selectedComponent: string | null = null;
  maxEmailLength: number = 50;

  clients: (Client & { imageSafeUrl: SafeUrl })[] = [];
  dropdownStates: { [key: string]: boolean } = {};

  private readonly defaultImageUrl: string = '/icons/user.jpg';

  constructor(
    private clientService: ClientService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.updateMaxEmailLength(window.innerWidth);
    this.getClientsQuantity();
    this.loadClients();
  }

  getClientsQuantity() {
    const token = localStorage.getItem('token') || '';
    this.clientService.getMyClientsQuantity(token).subscribe(
      (response) => {
        this.clientsQuantity = response;
      }
    );
  }

  async loadClients() {
    const token = localStorage.getItem('token') || '';
    this.clientService.getMyClients(token).subscribe(
      (data: Client[]) => {
        this.clients = data.map(client => ({
          ...client,
          imageSafeUrl: this.sanitizer.bypassSecurityTrustUrl(
            client.image ? client.image : this.defaultImageUrl
          )
        }));
        this.clients.forEach(client => {
          this.dropdownStates[client.id] = false;
        });
      }
    )
  }

  toggleDropdown(client: Client, event: Event) {
    event.stopPropagation();
    this.dropdownStates[client.id] = !this.dropdownStates[client.id];
  }

  showComponent(component: string, event: Event) {
    event.stopPropagation();
    this.selectedComponent = component;
  }

  clearSelectedComponent() {
    this.selectedComponent = null;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.updateMaxEmailLength((event.target as Window).innerWidth);
  }

  updateMaxEmailLength(width: number) {
    if (width < 430) this.maxEmailLength = 25;
    else if (width < 600) this.maxEmailLength = 40;
    else if ((width <= 1300 && width >= 1024) || (width <= 500 && width >= 430)) this.maxEmailLength = 35;
    else this.maxEmailLength = 50;
  }

  getDisplayLastName(client: Client): string {
    return window.innerWidth < 500 && client.last_name.length > 11 ? `${client.last_name.charAt(0)}.` : client.last_name;
  }
}
