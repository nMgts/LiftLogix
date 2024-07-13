import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { UserService } from "../../services/user.service";

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  email: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private readonly userService: UserService, private router: Router) {}

  async handleSubmit() {
    if (!this.email) {
      this.showError('Email jest wymagany');
      return;
    }
    try {
      const { success } = await this.userService.forgotPassword(this.email)
        if (success) {
          this.showSuccess('Email z dalszymi instrukcjami został wysłany')
          this.email = '';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        } else {
          this.showError('Użytkownik z podanym adresem email nie istnieje')
        }
    } catch (error) {
      this.showError('Nie udało się wysłać wiadomości e-mail'); // If server is not responding
    }
  }

  /** Methods for displaying success/error messages */

  showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 3000);
  }

  showSuccess(message: string) {
    this.successMessage = message;
  }
}
