import {Component, Inject} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Plan} from "../../interfaces/Plan";
import {PlanService} from "../../services/plan.service";

@Component({
  selector: 'app-save-plan-dialog',
  templateUrl: './save-plan-dialog.component.html',
  styleUrl: './save-plan-dialog.component.scss'
})
export class SavePlanDialogComponent {
  savePlanForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SavePlanDialogComponent>,
    private planService: PlanService
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
      const formValues = this.savePlanForm.value;

      const newPlan: Plan = {
        id: 0,
        name: formValues.planName,
        author: { id: 0, first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com', role: 'COACH' },
        isPublic: formValues.isPublic,
        mesocycles: this.data.macrocycle.mesocycles || []
      };

      const token = localStorage.getItem('token') || "";

      this.planService.createPlan(newPlan, token).subscribe(plan => {
        console.log('Plan created:', plan);
        this.dialogRef.close(plan);
      }, error => {
        console.error('Error creating plan:', error);
      });
    }
  }
}
