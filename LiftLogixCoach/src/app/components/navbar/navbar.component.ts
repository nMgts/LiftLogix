import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {UserService} from "../../services/user.service";
import {EditProfileDialogComponent} from "../edit-profile-dialog/edit-profile-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  menuOpen = false;

  constructor(private router: Router, private userService: UserService, private dialog: MatDialog) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  goToProfile() {
    this.menuOpen = false; // Zamknij menu po otwarciu dialogu
    const dialogRef = this.dialog.open(EditProfileDialogComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      // Wartość powrotna
      console.log('Dialog został zamknięty', result);
    });
  }

  logOut() {
    this.userService.logOut();
  }
}
