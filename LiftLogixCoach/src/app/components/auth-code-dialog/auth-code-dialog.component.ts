import { Component } from '@angular/core';
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'app-auth-code-dialog',
  templateUrl: './auth-code-dialog.component.html',
  styleUrl: './auth-code-dialog.component.scss'
})
export class AuthCodeDialogComponent {
  authCode: string = '';

  constructor(public dialogRef: MatDialogRef<AuthCodeDialogComponent>) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.dialogRef.close(this.authCode);
  }
}
