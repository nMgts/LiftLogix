import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from "@angular/material/dialog";
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { CoachService } from "../../services/coach.service";
import { Coach } from "../../interfaces/Coach";
import { Router } from "@angular/router";
import { EmailService } from "../../services/email.service";
import { UserService } from "../../services/user.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "../../services/auth.service";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import {NavbarComponent} from "../navbar/navbar.component";

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
  showEditButton: boolean = false;
  showImageInput: boolean = false;
  draggingOver: boolean = false;
  errorMessage: string = '';
  image: SafeUrl = '';
  newImage: SafeUrl = '';
  selectedImage: File | null = null;

  constructor(
    public dialogRef: MatDialogRef<EditProfileDialogComponent>,
    private fb: FormBuilder,
    private coachService: CoachService,
    private emailService: EmailService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer
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
    this.loadImage();
  }

  loadImage(): void {
    const id = localStorage.getItem('id') || '0';
    const token = localStorage.getItem('token') || '';
    this.userService.getUserImage(id, token).subscribe(
      (blob) => {
        const objectURL = URL.createObjectURL(blob);
        this.image = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      },
      () => {
        this.image = '/icons/user.jpg';
      }
    );
  }

  async onFileSelected(event: any) {
    this.selectedImage = event.target.files[0];

    const objectURL = URL.createObjectURL(await this.fileToBlob(this.selectedImage));
    this.newImage = this.sanitizer.bypassSecurityTrustUrl(objectURL);
  }


  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.draggingOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.draggingOver = false;
  }

  async onDrop(event: any) {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];

    if (droppedFile) {
      this.selectedImage = droppedFile;

      const objectURL = URL.createObjectURL(await this.fileToBlob(droppedFile));
      this.newImage = this.sanitizer.bypassSecurityTrustUrl(objectURL);
    }
  }

  uploadImage() {
    if (this.selectedImage) {

      const token = localStorage.getItem('token') || '';
      this.userService.updateImage(this.selectedImage, token).subscribe(
        () => {
          this.cancelImageChange();
          this.openSnackBar('Zdjęcie zostało zaktualizowane');
          this.userService.notifyImageUpdate();
        },
        (error) => {
          this.showError('Nie udało się zaktualizować zdjęcia');
        }
      );
    } else {
      this.showError('Wybierz zdjęcie do przesłania');
    }
  }

  deleteNewImage() {
    this.selectedImage = null;
    this.newImage = '';
  }

  cancelImageChange() {
    this.showImageInput = false;
    this.selectedImage = null;
    this.loadImage();
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
          this.loadProfile();
          this.dialogRef.close();
          this.openSnackBar('Profil został zaktualizowany');
        },
        (error) => {
          this.showError('Nie udało się zaktualizować profilu');
        }
      )
    } else {
      this.showError('Wprowadź wszystkie pola');
    }
  }

  editImage() {
    this.showImageInput = true;
  }

  changeEmail(): void {
    const token = localStorage.getItem('token') || '';
    this.emailService.sendVerificationCode(this.email, token).subscribe(
      () => {
        this.showVerificationCodeInput = true;
      },
      (error) => {
        this.showError('Nie udało się wysłać kodu weryfikacyjnego');
      }
    );
  }

  verifyCode(): void {
    const email = this.email;
    const code = this.emailForm.get('verificationCode')?.value;

    const token = localStorage.getItem('token') || '';
    this.userService.verifyCode(email, code, token).subscribe(
      () => {
        this.showNewEmailInput = true
      },
      (error) => {
        this.showError('Błędny kod weryfikacjny, spróbuj ponownie');
      }
    );
  }

  updateEmail(): void {
    if (this.emailForm.invalid) {
      this.showError('Nieprawidłowy adres email');
      return;
    }

    const newEmail = this.emailForm.get('newEmail')?.value;
    const verificationCode = this.emailForm.get('verificationCode')?.value;

    const token = localStorage.getItem('token') || '';
    this.emailService.updateEmail(this.email, newEmail, verificationCode, token).subscribe(
      () => {
        this.dialogRef.close();
        this.authService.logout();
        this.router.navigate(['/login']);
        this.openSnackBar('E-mail został zaktualizowany');
      },
      (error) => {
        this.showError('Nie udało się zaktualizować adresu email');
      }
    );
  }

  cancelEmailChange(): void {
    this.showVerificationCodeInput = false;
    this.showNewEmailInput = false;
    this.emailForm.reset();
    this.loadImage();
  }

  emailValidator(control: AbstractControl): ValidationErrors | null {
    const emailRegex = new RegExp('^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$');
    if (control.value && !emailRegex.test(control.value)) {
      return { invalidEmail: true };
    }
    return null;
  }

  close() {
    this.dialogRef.close();
  }

  fileToBlob(file: File | null): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer && file != null) {
          const blob = new Blob([new Uint8Array(reader.result)], {type: file.type});
          resolve(blob);
        } else {
          reject(new Error('Failed to convert file to Blob'));
        }
      };
      reader.onerror = reject;
      // @ts-ignore
      reader.readAsArrayBuffer(file);
    });
  }

  private openSnackBar(message: string): void {
    this.snackBar.open(message, 'Zamknij', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }

  showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 3000);
  }
}
