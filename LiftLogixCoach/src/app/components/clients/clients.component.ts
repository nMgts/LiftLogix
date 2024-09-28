import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { Client } from "../../interfaces/Client";
import { ClientService } from "../../services/client.service";
import { ApplicationService } from "../../services/application.service";
import { User } from "../../interfaces/User";

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss'
})
export class ClientsComponent implements OnChanges {
  @Input() isBoxExpanded = false;
  @Output() openChat = new EventEmitter<User>();
  @Output() closeBox = new EventEmitter<void>();
  @ViewChild('elem', { static: true }) elem!: ElementRef;
  scrollTimeout: any;

  isFullScreen = false;

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
    private applicationService: ApplicationService,
    private renderer: Renderer2
  ) {}

  ngOnChanges(): void {
    this.getClientsQuantity();
    if (this.isBoxExpanded) {
      this.loadClients();
      this.updateMaxEmailLength(window.innerWidth);
    }
    this.applicationService.clientsQuantityUpdated$.subscribe(() => {
      this.getClientsQuantity();
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

  toggleFullScreen(event: Event): void {
    event.stopPropagation();
    this.isFullScreen = !this.isFullScreen;
  }

  toggleDropdown(client: Client) {
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

  switchHeader(selectedComponent: string): string {
    switch (selectedComponent) {
      case 'results':
        return 'Wyniki';
      case 'plan':
        return 'Plan';
      case 'schedule':
        return 'Harmonogram';
      case 'diet':
        return 'Dieta';
      default:
        return '';
    }
  }

  onScroll(event: Event): void {
    const target = event.target as HTMLElement;

    if (target) {
      this.renderer.addClass(document.body, 'show-scrollbar');

      clearTimeout(this.scrollTimeout);

      this.scrollTimeout = setTimeout(() => {
        this.renderer.removeClass(document.body, 'show-scrollbar');
      }, 3000);
    }
  }

  onOpenChat(client: Client) {
    const user: User = {
      id: client.id,
      first_name: client.first_name,
      last_name: client.last_name,
      email: client.email,
      role: 'CLIENT'
    }
    this.openChat.emit(user);
  }

  goBack() {
    this.clearSelectedComponent();
    this.selectedClientId = 0;
  }

  close(event: Event) {
    event.stopPropagation();
    this.clearSelectedComponent();
    this.closeBox.emit();
  }
}
