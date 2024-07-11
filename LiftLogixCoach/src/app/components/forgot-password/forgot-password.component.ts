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
      this.showError("Email jest wymagany");
      return;
    }

    this.userService.forgotPassword(this.email).subscribe(
      () => {
        this.showSuccess("E-mail z instrukcjami resetowania hasła został wysłany.");
      },
      (error) => {
        this.showError(error.message);
      }
    );
    this.showSuccess("E-mail z instrukcjami resetowania hasła został wysłany.");
  }

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
