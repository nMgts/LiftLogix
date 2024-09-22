import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Plan } from "../../interfaces/Plan";
import { PlanService } from "../../services/plan.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { PersonalPlanService } from "../../services/personal-plan.service";
import { formatDate } from "@angular/common";
import { ClientService } from "../../services/client.service";
import { Client } from "../../interfaces/Client";
import { PersonalPlan } from "../../interfaces/PersonalPlan";
import { WorkoutUnit } from "../../interfaces/WorkoutUnit";
import _ from "lodash";

@Component({
  selector: 'app-save-plan-dialog',
  templateUrl: './save-plan-dialog.component.html',
  styleUrl: './save-plan-dialog.component.scss'
})
export class SavePlanDialogComponent {
  savePlanForm: FormGroup;
  today: string = formatDate(new Date(), 'yyyy.MM.dd', 'en');
  client: Client | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SavePlanDialogComponent>,
    private clientService: ClientService,
    private planService: PlanService,
    private personalPlanService: PersonalPlanService,
    private snackBar: MatSnackBar,
  ) {
    this.savePlanForm = this.fb.group({
      planName: [this.data.planName || '', Validators.required],
      isPublic: [false],
      startDate: [this.today, this.data.clientId ? [Validators.required, this.dateValidator] : []]
    });

    if (data.clientId) {
      this.getClient();
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSave(): void {
    if (this.savePlanForm.valid) {
      const formValues = this.savePlanForm.value;

      const newPlan: Plan = {
        id: 0,
        name: formValues.planName,
        author: { id: 0, first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com', role: 'COACH' },
        public: formValues.isPublic,
        mesocycles: this.data.macrocycle.mesocycles || []
      };

      const token = localStorage.getItem('token') || "";

      if (this.data.clientId) {
        const formattedDate = formatDate(formValues.startDate, 'yyyy-MM-dd', 'en');

        if (this.client === null) {
          this.openSnackBar('Nie udało się wczytać klienta')
          this.dialogRef.close(false);
        } else {
          const personalPlan: PersonalPlan = {
            id: 0,
            name: formValues.planName,
            mesocycles: this.data.macrocycle.mesocycles || [],
            client: this.client,
            startDate: formattedDate,
            length: 0,
            active: true
          }

          const newPersonalPlan: PersonalPlan = _.cloneDeep(personalPlan);

          newPersonalPlan.mesocycles.forEach(mesocycle => {
            mesocycle.microcycles.forEach(microcycle => {
              microcycle.workouts.forEach(workout => {
                workout.days.forEach(day => {
                  const workoutUnit: WorkoutUnit = {
                    id: 0,
                    name: workout.name,
                    workoutExercises: workout.workoutExercises,
                    date: "1970-01-01T00:00:00",
                    individual: true,
                    duration: 60,
                    microcycleDay: day
                  };
                  microcycle.workoutUnits.push(workoutUnit);
                })
              })
              microcycle.workouts = [];
            })
          })

          this.personalPlanService.createPlan(newPersonalPlan, token).subscribe(plan => {
            this.dialogRef.close(true);
            this.openSnackBar('Plan ' + formValues.planName + ' został przypisany do klienta');
          }, error => {
            this.dialogRef.close(false);
            this.openSnackBar('Przypisanie planu nie powiodło się');
          })
        }
      } else {
        this.planService.createPlan(newPlan, token).subscribe(plan => {
          this.dialogRef.close(true);
          this.openSnackBar('Plan ' + formValues.planName + ' został zapisany');
        }, error => {
          this.dialogRef.close(false);
          this.openSnackBar('Nie udało się zapisać planu');
        });
      }
      }
  }

  getClient() {
    const token = localStorage.getItem('token') || '';
    this.clientService.getClient(this.data.clientId, token).subscribe( client => {
      this.client = client;
      }
    )
  }

  dateValidator(control: AbstractControl) {
    const inputDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (inputDate < today) {
      return { 'invalidDate': true };
    }
    return null;
  }

  private openSnackBar(message: string) {
    this.snackBar.open(message, 'Zamknij', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }
}
