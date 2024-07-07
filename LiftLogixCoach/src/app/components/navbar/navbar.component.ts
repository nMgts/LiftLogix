import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  menuOpen = false;

  constructor(private router: Router, private userService: UserService) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  goToProfile() {
    this.menuOpen = false;
    this.router.navigate(['/profile']);
  }

  logOut() {
    this.userService.logOut();
  }
}
