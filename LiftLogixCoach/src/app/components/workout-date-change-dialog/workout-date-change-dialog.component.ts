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
  startTime: string = '';
  endTime: string = '';

  constructor(
    public dialogRef: MatDialogRef<WorkoutDateChangeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { workoutId: number, oldDate: string, duration: number }
  ) {
    this.newDate = new Date(data.oldDate);
    this.startTime = format(new Date(data.oldDate), 'HH:mm');

    const startDate = new Date(data.oldDate);
    const endDate = new Date(startDate.getTime() + data.duration * 60000);

    this.endTime = format(endDate, 'HH:mm');
  }

  onSave(): void {
    if (this.newDate && this.startTime && this.endTime) {
      const [startHours, startMinutes] = this.startTime.split(':').map(Number);
      const updatedStartDate = new Date(this.newDate);
      updatedStartDate.setHours(startHours);
      updatedStartDate.setMinutes(startMinutes);

      const [endHours, endMinutes] = this.endTime.split(':').map(Number);
      const updatedEndDate = new Date(this.newDate);
      updatedEndDate.setHours(endHours);
      updatedEndDate.setMinutes(endMinutes);

      if (updatedEndDate <= updatedStartDate) {
        updatedEndDate.setDate(updatedEndDate.getDate() + 1);
      }

      const duration = (updatedEndDate.getTime() - updatedStartDate.getTime()) / (1000 * 60);

      if (duration > 0) {
        const formattedNewDate = format(updatedStartDate, "yyyy-MM-dd'T'HH:mm:ss");

        this.dialogRef.close({
          workoutId: this.data.workoutId,
          oldDate: this.data.oldDate,
          newDate: formattedNewDate,
          duration: duration
        });
      } else {
        alert('Godzina zakończenia musi być późniejsza niż godzina rozpoczęcia!');
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
