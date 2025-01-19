import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { EmailService } from "../../services/email.service";
import { MatDialog } from "@angular/material/dialog";
import { AuthCodeDialogComponent } from "../auth-code-dialog/auth-code-dialog.component";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  showResendConfirmation: boolean = false;
  passwordFieldType = 'password';

  constructor(
    private authService: AuthService,
    private emailService: EmailService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  async handleSubmit() {
    if (!this.email || !this.password) {
      this.showError('Email i hasło są wymagane');
      return
    }
    try {

      let loginResult = await this.authService.login(this.email, this.password, this.rememberMe, '');

      if (loginResult.success) {
        localStorage.setItem('token', loginResult.token);
        localStorage.setItem('role', loginResult.role);
        localStorage.setItem('rememberMe', String(this.rememberMe));
        localStorage.setItem('id', loginResult.id);
        localStorage.setItem('email', loginResult.email);

        if (loginResult.role === "COACH") {
          await this.router.navigate(['/dashboard']);
        } else if (loginResult.role === "ADMIN") {
          await this.router.navigate(['/dashboard-admin']);
        }
      } else {
        if (loginResult.error === 'User is not confirmed') {

          this.showResendConfirmation = true;
          this.showError('Proszę potwierdzić adres e-mail.');

        } else if (loginResult.error === 'Two factor authentication required') {

          const dialogRef = this.dialog.open(AuthCodeDialogComponent);
          dialogRef.afterClosed().subscribe(async (authCode: string) => {
            if (authCode) {
              loginResult = await this.authService.login(this.email, this.password, this.rememberMe, authCode);

              if (loginResult.success) {
                localStorage.setItem('token', loginResult.token);
                localStorage.setItem('role', loginResult.role);
                localStorage.setItem('rememberMe', String(this.rememberMe));
                localStorage.setItem('id', loginResult.id);
                localStorage.setItem('email', loginResult.email);

                if (loginResult.role === "COACH") {
                  await this.router.navigate(['/dashboard']);
                } else if (loginResult.role === "ADMIN") {
                  await this.router.navigate(['/dashboard-admin']);
                }
              } else {
                this.showError('Błędny kod autentykacyjny.');
              }
            }
          });
        } else {
          this.showError('Błędne dane');
        }
      }
    } catch (error) {
      this.showError('Nie udało się zalogować');
    }
  }

  async resendConfirmationEmail() {
    try {
      await this.emailService.resendConfirmationEmail(this.email);
      this.showSuccess('E-mail potwierdzający został ponownie wysłany.');
    } catch (error: any) {
      this.showError('Wystąpił błąd podczas wysyłania e-maila potwierdzającego.');
    }
  }

  togglePasswordField(): void {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  /** Methods for displaying success/error messages */

  showError(mess: string) {
    this.errorMessage = mess;
    this.successMessage = '';
    setTimeout(() => {
      this.errorMessage = ''
    }, 3000);
  }

  showSuccess(mess: string) {
    this.successMessage = mess;
    this.showResendConfirmation = false;
    this.errorMessage = '';
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }
}
