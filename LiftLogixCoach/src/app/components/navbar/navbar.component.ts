import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { EditProfileDialogComponent } from "../edit-profile-dialog/edit-profile-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  menuOpen = false;

  constructor(private router: Router, private authService: AuthService, private dialog: MatDialog) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  goToProfile() {
    this.menuOpen = false;
    const dialogRef = this.dialog.open(EditProfileDialogComponent, {
      width: '600px'
    });
  }

  logOut() {
    this.authService.logout();
  }
}
