import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'app-save-plan-dialog',
  templateUrl: './save-plan-dialog.component.html',
  styleUrl: './save-plan-dialog.component.scss'
})
export class SavePlanDialogComponent {
  savePlanForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SavePlanDialogComponent>
  ) {
    this.savePlanForm = this.fb.group({
      planName: ['', Validators.required],
      isPublic: [false]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.savePlanForm.valid) {
      const planData = this.savePlanForm.value;
      this.dialogRef.close(planData);
    }
  }
}
