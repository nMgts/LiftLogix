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
  errorMessage: string = '';
  showResendConfirmation: boolean = false;

  constructor(private readonly  userService: UserService, private router: Router) {}

  async handleSubmit() {
    if (!this.email || !this.password) {
      this.showError("Email i hasło są wymagane");
      return
    }

    try {
      const { success, token, role, message } = await this.userService.login(this.email, this.password);
      if (success) {
        localStorage.setItem('token', token)
        localStorage.setItem('role', role)
        if (role === "COACH") {
          await this.router.navigate(['/dashboard']);
        } else if (role === "ADMIN") {
          await this.router.navigate(['/dashboard-admin']);
        }
      } else {
        if (message === "User is not confirmed") {
          this.showResendConfirmation = true;
          this.showError("Proszę potwierdzić adres e-mail.");
        } else {
          this.showError(message);
        }
      }
    } catch (error: any) {
      this.showError(error.message)
    }
  }

  showError(mess: string) {
    this.errorMessage = mess;
    setTimeout(()=>{
      this.errorMessage = ''
    }, 3000)
  }

  async resendConfirmationEmail() {
    try {
      await this.userService.resendConfirmationEmail(this.email);
      this.showError("E-mail potwierdzający został ponownie wysłany.");
    } catch (error: any) {
      this.showError("Wystąpił błąd podczas wysyłania e-maila potwierdzającego.");
    }
  }
}
