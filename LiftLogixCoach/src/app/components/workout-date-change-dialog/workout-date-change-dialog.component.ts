import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { format } from "date-fns";

@Component({
  selector: 'app-workout-date-change-dialog',
  templateUrl: './workout-date-change-dialog.component.html',
  styleUrl: './workout-date-change-dialog.component.scss'
})
export class WorkoutDateChangeDialogComponent {
  newDate: Date;
  newTime: string = '';

  constructor(
    public dialogRef: MatDialogRef<WorkoutDateChangeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { workoutId: number, oldDate: string }
  ) {
    this.newDate = new Date(data.oldDate);
    this.newTime = format(new Date(data.oldDate), 'HH:mm');
  }

  onSave(): void {
    if (this.newDate && this.newTime) {
      const [hours, minutes] = this.newTime.split(':').map(Number);
      const updatedDate = new Date(this.newDate);
      updatedDate.setHours(hours);
      updatedDate.setMinutes(minutes);

      const formattedNewDate = format(updatedDate, "yyyy-MM-dd'T'HH:mm:ss");
      console.log(formattedNewDate);

      this.dialogRef.close({ workoutId: this.data.workoutId, oldDate: this.data.oldDate, newDate: formattedNewDate });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
