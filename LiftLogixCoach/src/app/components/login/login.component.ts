import { Component } from '@angular/core';
import {UserService} from "../../services/user.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email: string = ''
  password: string = ''
  errorMessage: string = ''

  constructor(private readonly  userService: UserService, private router: Router) {}

  async handleSubmit() {
    if (!this.email || !this.password) {
      this.showError("Email and Password is required");
      return
    }

    try {
      const { success, token, role, message } = await this.userService.login(this.email, this.password);
      if (success) {
        localStorage.setItem('token', token)
        localStorage.setItem('role', role)
        if (role === "COACH") {
          await this.router.navigate(['/dashboard']);
        } else {
          await this.router.navigate(['/dashboard-admin']);
        }
      } else {
        this.showError(message)
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
}
