import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Application } from "../../interfaces/Application";
import { ApplicationService } from "../../services/application.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-application-details-dialog',
  templateUrl: './application-details-dialog.component.html',
  styleUrl: './application-details-dialog.component.scss'
})
export class ApplicationDetailsDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Application,
    public dialogRef: MatDialogRef<ApplicationDetailsDialogComponent>,
    private applicationService: ApplicationService,
    private snackBar: MatSnackBar,) {}

  sendMessage(): void {}

  accept(applicationId: number): void {
    const token = localStorage.getItem('token') || '';
    this.applicationService.acceptApplication(applicationId, token).subscribe(
      () => {
        this.dialogRef.close();
        this.openSnackBar('Zgłoszenie przyjęte - dodano nowego klienta');
      },
      (error: any) => console.error('Error accepting application', error)
    );
  }

  reject(applicationId: number): void {
    const token = localStorage.getItem('token') || '';
    this.applicationService.rejectApplication(applicationId, token).subscribe(
      () => {
        this.dialogRef.close();
        this.openSnackBar('Zgłoszenie odrzucone');
      },
      (error: any) => console.error('Error rejecting application', error)
    );
  }

  private openSnackBar(message: string): void {
    this.snackBar.open(message, 'Zamknij', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }
}
