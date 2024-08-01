import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";

@Component({
  selector: 'app-exercise-details-dialog',
  templateUrl: './exercise-details-dialog.component.html',
  styleUrl: './exercise-details-dialog.component.scss'
})
export class ExerciseDetailsDialogComponent {
  safeUrl: SafeHtml;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sanitizer: DomSanitizer,
    public dialogRef: MatDialogRef<ExerciseDetailsDialogComponent>
  ) {
    this.safeUrl = this.sanitizer.bypassSecurityTrustHtml(data.url);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
