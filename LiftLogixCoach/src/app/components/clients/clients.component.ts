import { Component, HostListener, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { Client } from "../../interfaces/Client";
import { ClientService } from "../../services/client.service";
import {ApplicationService} from "../../services/application.service";

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
  selectedClientId: number = 0;
  maxEmailLength: number = 50;

  clients: (Client & { imageSafeUrl: SafeUrl })[] = [];
  dropdownOpenClientId: number | null = null;

  private readonly defaultImageUrl: string = '/icons/user.jpg';

  constructor(
    private clientService: ClientService,
    private sanitizer: DomSanitizer,
    private applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
    this.updateMaxEmailLength(window.innerWidth);
    this.getClientsQuantity();
    this.loadClients();
    this.applicationService.clientsQuantityUpdated$.subscribe(() => {
      this.getClientsQuantity();
      this.loadClients();
    });
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
        this.dropdownOpenClientId = null;
      }
    )
  }

  toggleDropdown(client: Client, event: Event) {
    event.stopPropagation();
    if (this.dropdownOpenClientId === client.id) {
      this.dropdownOpenClientId = null;
    } else {
      this.dropdownOpenClientId = client.id;
    }
  }

  showComponent(component: string, clientId: number, event: Event) {
    event.stopPropagation();
    this.selectedComponent = component;
    this.selectedClientId = clientId;
    this.clientService.setSelectedClientId(clientId);
  }

  clearSelectedComponent() {
    this.selectedComponent = null;
    this.clientService.setSelectedClientId(null);
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

  protected readonly innerWidth = innerWidth;
}
