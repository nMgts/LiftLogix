import { Component, HostListener, Input, OnInit } from '@angular/core';

interface Client {
  profileImage: string;
  first_name: string;
  last_name: string;
  email: string;
  isDropdownOpen?: boolean;
}

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss'
})
export class ClientsComponent implements OnInit{
  @Input() isBoxExpanded = false;
  protected readonly window = window;
  selectedComponent: string | null = null;
  maxEmailLength: number = 50;

  clients: Client[] = [
    { profileImage: '/images/logo.svg', first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com' },
    { profileImage: '/images/logo.svg', first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@example.com' },
    { profileImage: '/images/logo.svg', first_name: 'Maksymilian', last_name: 'Jędrzeszczykiwiecz', email: 'maksymilan.jedrzeszczykiwiecz.1234567890@gmail.com' }
  ];

  constructor() {}

  ngOnInit(): void {
    this.updateMaxEmailLength(window.innerWidth);
  }

  toggleDropdown(client: Client, event: Event) {
    event.stopPropagation();
    client.isDropdownOpen = !client.isDropdownOpen;
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
