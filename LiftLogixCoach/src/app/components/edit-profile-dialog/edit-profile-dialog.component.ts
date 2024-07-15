import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from "@angular/forms";
import {CoachService} from "../../services/coach.service";
import {Coach} from "../../interfaces/Coach";
import {Router} from "@angular/router";

@Component({
  selector: 'app-edit-profile-dialog',
  templateUrl: './edit-profile-dialog.component.html',
  styleUrl: './edit-profile-dialog.component.scss'
})
export class EditProfileDialogComponent implements OnInit {
  profileForm: FormGroup;
  emailForm: FormGroup;
  passwordForm: FormGroup;
  email: string = '';
  showVerificationCodeInput: boolean = false;
  showNewEmailInput: boolean = false;
  showVerifyPasswordInput: boolean = false;
  showNewPasswordInput: boolean = false;
  verificationError: string = '';
  updateError: string = '';
  updatePasswordError: string = '';
  wrongPasswordError: string = '';
  passwordFieldType: string = 'password';

  constructor(
    public dialogRef: MatDialogRef<EditProfileDialogComponent>,
    private fb: FormBuilder,
    private coachService: CoachService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      description: ['']
    })
    this.emailForm = this.fb.group({
      verificationCode: ['', Validators.required],
      newEmail: ['', [Validators.required, Validators.email, this.emailValidator]]
    })
    this.passwordForm = this.fb.group({
      password: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator.bind(this)
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    const token = localStorage.getItem('token') || '';
    this.coachService.getProfile(token).subscribe(
      (profile: Coach) => {
        this.profileForm.patchValue({
          firstName: profile.first_name,
          lastName: profile.last_name,
          description: profile.description
        });
        this.email = profile.email;
      },
      (error) => {
        console.error('Error loading profile', error);
      }
    )
  }

  togglePasswordField(): void {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  saveChanges(): void {
    if (this.profileForm.valid) {
      const profileData: Coach = {
        first_name: this.profileForm.get('firstName')?.value,
        last_name: this.profileForm.get('lastName')?.value,
        description: this.profileForm.get('description')?.value,
        email: this.email
      };

      const token = localStorage.getItem('token') || '';
      this.coachService.updateProfile(profileData, token).subscribe(
        (updatedProfile) => {
          console.log('Profile updated successfully', updatedProfile);
          this.loadProfile();
        },
        (error) => {
          console.error('Error updating profile', error);
        }
      )
    }
  }

  changeEmail(): void {
    const token = localStorage.getItem('token') || '';
    this.coachService.sendVerificationCode(this.email, token).subscribe(
      () => {
        this.showVerificationCodeInput = true;
      },
      (error) => {
        console.error('Error sending verification code', error);
      }
    );
  }

  verifyCode(): void {
    const email = this.email;
    const code = this.emailForm.get('verificationCode')?.value;

    const token = localStorage.getItem('token') || '';
    this.coachService.verifyCode(email, code, token).subscribe(
      () => {
        this.showNewEmailInput = true
        this.verificationError = '';
      },
      (error) => {
        console.error('Error verifying code', error);
        this.verificationError = 'Błędny kod weryfikacyjny. Spróbuj ponownie.';
      }
    );
  }

  updateEmail(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    const newEmail = this.emailForm.get('newEmail')?.value;
    const verificationCode = this.emailForm.get('verificationCode')?.value;

    const token = localStorage.getItem('token') || '';
    this.coachService.updateEmail(this.email, newEmail, verificationCode, token).subscribe(
      () => {
        console.log('Email updated successfully');
        this.updateError = '';
        this.dialogRef.close();
        localStorage.clear();
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Error updating email:', error);
        this.updateError = 'Adres email niedostępny';
      }
    );
  }

  cancelEmailChange(): void {
    this.showVerificationCodeInput = false;
    this.showNewEmailInput = false;
    this.emailForm.reset();
  }

  emailValidator(control: AbstractControl): ValidationErrors | null {
    const emailRegex = new RegExp('^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$');
    if (control.value && !emailRegex.test(control.value)) {
      return { invalidEmail: true };
    }
    return null;
  }

  changePassword(): void {
    this.showVerifyPasswordInput = true;
  }

  checkPassword(): void {
    const password = this.passwordForm.get("password")?.value;

    const token = localStorage.getItem('token') || '';
    this.coachService.checkPassword(password, token).subscribe(
      () => {
        this.wrongPasswordError = '';
        this.passwordFieldType = 'password';
        this.showNewPasswordInput = true;
      },
      (error) => {
        console.error('Złe hasło', error);
        this.wrongPasswordError = "Złe hasło";
      }
    );
  }

  updatePassword(): void {
    const password = this.passwordForm.get('newPassword')?.value;

    const token = localStorage.getItem('token') || '';
    this.coachService.updatePassword(password, token).subscribe(
      () => {
        this.updatePasswordError = '';
        this.dialogRef.close();
        localStorage.clear();
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Nie udało się zmienić hasła', error);
        this.updatePasswordError = 'Nie udało się zmienić hasła';
      }
    );
  }

  cancelPasswordChange(): void {
    this.showVerifyPasswordInput = false;
    this.showNewPasswordInput = false;
    this.passwordFieldType = 'password';
    this.passwordForm.reset();
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
}
