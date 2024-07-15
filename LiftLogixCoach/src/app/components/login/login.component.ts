import { Component } from '@angular/core';
import {UserService} from "../../services/user.service";
import {Router} from "@angular/router";

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

  constructor(private readonly  userService: UserService, private router: Router) {}

  async handleSubmit() {
    if (!this.email || !this.password) {
      this.showError('Email i hasło są wymagane');
      return
    }
    try {

      const { success, token, role, error } = await this.userService.login(this.email, this.password, this.rememberMe);

      if (success) {
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('rememberMe', String(this.rememberMe));
        if (role === "COACH") {
          await this.router.navigate(['/dashboard']);
        } else if (role === "ADMIN") {
          await this.router.navigate(['/dashboard-admin']);
        }
      } else {
        if (error === 'User is not confirmed') {
          this.showResendConfirmation = true;
          this.showError('Proszę potwierdzić adres e-mail.');
        } else {
          this.showError('Błędne dane');
        }
      }
    } catch (error) {
      this.showError('Nie udało się zalogować'); // If server is not responding
    }
  }

  async resendConfirmationEmail() {
    try {
      await this.userService.resendConfirmationEmail(this.email);
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
