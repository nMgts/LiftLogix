import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'app-delete-report-dialog',
  templateUrl: './delete-report-dialog.component.html',
  styleUrl: './delete-report-dialog.component.scss'
})
export class DeleteReportDialogComponent {
  deleteClientReport: boolean = false;
  deleteCoachReport: boolean = false;
  showConfirmationMessage: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<DeleteReportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (!data.clientReport && !data.coachReport) {
      this.showConfirmationMessage = true;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close({
      deleteClientReport: this.deleteClientReport,
      deleteCoachReport: this.deleteCoachReport
    });
  }
}
