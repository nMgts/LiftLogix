import { Component } from '@angular/core';
import { MatDialogRef } from "@angular/material/dialog";
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { UserService } from "../../services/user.service";
import { Router } from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-security-options-dialog',
  templateUrl: './security-options-dialog.component.html',
  styleUrl: './security-options-dialog.component.scss'
})
export class SecurityOptionsDialogComponent {
  passwordForm: FormGroup;
  errorMessage: string = '';
  showVerifyPasswordInput: boolean = false;
  showNewPasswordInput: boolean = false;
  passwordFieldType: string = 'password';

  constructor(
    public dialogRef: MatDialogRef<SecurityOptionsDialogComponent>,
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.passwordForm = this.fb.group({
      password: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator.bind(this)
    });
  }

  changePassword() {
    this.showVerifyPasswordInput = true;
  }

  checkPassword(): void {
    const password = this.passwordForm.get("password")?.value;
    const token = localStorage.getItem('token') || '';

    this.userService.checkPassword(password, token).subscribe(
      () => {
        this.passwordFieldType = 'password';
        this.showNewPasswordInput = true;
      },
      (error) => {
        this.showError('Złe hasło');
      }
    )
  }

  updatePassword(): void {
    const newPassword = this.passwordForm.get('newPassword')?.value;
    const confirmPassword = this.passwordForm.get('confirmPassword')?.value;

    if (newPassword === '' || confirmPassword === '') {
      this.showError("Pola nie mogą być puste");
      return
    }

    if (newPassword === confirmPassword) {
      const token = localStorage.getItem('token') || '';
      this.userService.updatePassword(newPassword, token).subscribe(
        () => {
          this.dialogRef.close();
          this.authService.logout();
          this.router.navigate(['/login']);
          this.openSnackBar('Hasło zostało zaktualizowane');
        },
        (error) => {
          this.showError('Nie udało się zmienić hasła');
        }
      );
    } else {
      this.showError('Hasła nie są takie same')
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      return null;
    }
  }

  cancelPasswordChange(): void {
    this.showNewPasswordInput = false;
    this.showVerifyPasswordInput = false;
    this.passwordForm.reset();
  }

  togglePasswordField(): void {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  saveChanges(): void {
    this.dialogRef.close();
  }

  close(): void {
    this.dialogRef.close();
  }

  private openSnackBar(message: string): void {
    this.snackBar.open(message, 'Zamknij', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }

  showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 3000);
  }
}
