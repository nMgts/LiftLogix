import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { EditProfileDialogComponent } from "../edit-profile-dialog/edit-profile-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { AuthService } from "../../services/auth.service";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { UserService } from "../../services/user.service";
import {SecurityOptionsDialogComponent} from "../security-options-dialog/security-options-dialog.component";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  menuOpen = false;
  settingsOpen = false;
  image: SafeUrl = '';

  constructor(
    private authService: AuthService, private userService: UserService,
    private dialog: MatDialog, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.loadImage();
    this.userService.imageUpdated$.subscribe(() => {
      this.loadImage();
    });
  }

  loadImage() {
    const id = localStorage.getItem('id') || '0';
    const token = localStorage.getItem('token') || '';
    this.userService.getUserImage(id, token).subscribe(
      (blob) => {
        const objectURL = URL.createObjectURL(blob);
        this.image = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      },
      (error) => {
        this.image = '/icons/user.jpg';
      }
    );
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    this.settingsOpen = false;
  }

  toggleSettings() {
    this.settingsOpen = !this.settingsOpen;
    this.menuOpen = false;
  }

  toggleLanguage() {

  }

  toggleDarkMode() {

  }

  goToProfile() {
    this.menuOpen = false;
    const dialogRef = this.dialog.open(EditProfileDialogComponent, {
      width: '360px',
      height: '600px',
      panelClass: 'custom-dialog-container'
    });
  }

  goToSecurity() {
    this.settingsOpen = false;
    const dialogRef = this.dialog.open(SecurityOptionsDialogComponent, {
      width: '360px',
      height: '600px',
      panelClass: 'custom-dialog-container'
    });
  }

  logOut() {
    this.authService.logout();
  }
}
