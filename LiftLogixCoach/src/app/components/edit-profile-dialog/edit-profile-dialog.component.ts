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
  email: string = '';
  showVerificationCodeInput: boolean = false;
  showNewEmailInput: boolean = false;
  verificationError: string = '';

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
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.coachService.getProfile().subscribe(
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

  saveChanges(): void {
    if (this.profileForm.valid) {
      const profileData: Coach = {
        first_name: this.profileForm.get('firstName')?.value,
        last_name: this.profileForm.get('lastName')?.value,
        description: this.profileForm.get('description')?.value,
        email: this.email
      };

      this.coachService.updateProfile(profileData).subscribe(
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
    this.coachService.sendVerificationCode(this.email).subscribe(
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

    this.coachService.verifyCode(email, code).subscribe(
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

    this.coachService.updateEmail(this.email, newEmail, verificationCode).subscribe(
      () => {
        console.log('Email updated successfully');
        this.dialogRef.close();
        localStorage.clear();
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Error updating email', error);
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
}
