import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'app-edit-result-dialog',
  templateUrl: './edit-result-dialog.component.html',
  styleUrl: './edit-result-dialog.component.scss'
})
export class EditResultDialogComponent {
  editForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditResultDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      benchpress: [data.benchpress, [Validators.min(0)]],
      squat: [data.squat, [Validators.min(0)]],
      deadlift: [data.deadlift, [Validators.min(0)]],
      date: [data.date, Validators.required]
    });
  }

  onSave(): void {
    if (this.editForm.valid) {
      this.dialogRef.close(this.editForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
