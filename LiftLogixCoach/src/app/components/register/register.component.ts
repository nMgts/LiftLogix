import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  formData: any = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: ''
  };
  errorMessage: string = '';
  successMessage: string = '';
  passwordFieldType = 'password';

  constructor(private readonly userService: UserService, private readonly router: Router) {}

  async handleSubmit(event: Event) {
    event.preventDefault();

    if (!this.validateFormFields()) {
      return;
    }

    const { confirm_password, ...userData } = this.formData;

    try {
      const { success, error } = await this.userService.register(userData);

      console.log(this.userService.register(userData));
        if (success) {
          this.showSuccess('Rejestracja zakończona sukcesem! Proszę potwierdzić adres e-mail.')
          this.formData.clear;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        } else {
          this.showError('Email jest zajęty');
        }
    } catch (error) {
      this.showError('Nie udało się zarejestrować') // If server is not responding
    }
  }

  togglePasswordField(): void {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  /** Validation methods */

  validateFormFields(): boolean {
    if (!this.formData.first_name || !this.formData.last_name || !this.formData.email || !this.formData.password || !this.formData.confirm_password) {
      this.showError('Uzupełnij wszystkie pola.');
      return false;
    }

    if (this.formData.password !== this.formData.confirm_password) {
      this.showError('Hasła nie są takie same.');
      return false;
    }

    if (!this.validateEmailFormat(this.formData.email)) {
      return false;
    }
    return true;
  }

  validateEmailFormat(email: string): boolean {
    const emailRegex = new RegExp('^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$');

    if (!emailRegex.test(email)) {
      this.showError('Nieprawidłowy format adresu e-mail.');
      return false;
    }
    return true;
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
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }
}
