import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  passwordFieldType = 'password';

  constructor(private route: ActivatedRoute, private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    })
  }

  async handleSubmit() {
    if (this.newPassword !== this.confirmPassword) {
      this.showError('Hasła nie pasują do siebie');
      return;
    }
    try {
      const { success } = await this.userService.resetPassword(this.token, this.newPassword);
      if (success) {
        this.showSuccess('Hasło zostało pomyślnie zresetowane');
        this.newPassword = '';
        this.confirmPassword = '';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      } else {
        this.showError('Token wygasł lub jest nieprawidłowy');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      }
    } catch (error) {
      this.showError('Nie udało się zresetetować hasła');
    }
  }

  togglePasswordField(): void {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
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
