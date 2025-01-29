import { Component, ElementRef, Inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { ClientService } from "../../services/client.service";
import { Client } from "../../interfaces/Client";
import { ReportService } from "../../services/report.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Report } from "../../interfaces/Report";

@Component({
  selector: 'app-create-report-dialog',
  templateUrl: './create-report-dialog.component.html',
  styleUrl: './create-report-dialog.component.scss'
})
export class CreateReportDialogComponent implements OnInit, OnDestroy {
  @ViewChild('elem', { static: true }) elem!: ElementRef;
  scrollTimeout: any;

  private clientIdSubscription!: Subscription;
  client: Client | null = null;

  reportDescription: string = '';
  isWorkoutDone: boolean = false;
  isWorkoutNotDone: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<CreateReportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { workoutUnitId: number },
    private reportService: ReportService,
    private clientService: ClientService,
    private snackBar: MatSnackBar,
    private renderer: Renderer2
  ) {
    console.log(this.data.workoutUnitId)
  }

  ngOnInit() {
    const token = localStorage.getItem('token') || '';
    this.clientIdSubscription = this.clientService.selectedClientId$.subscribe(clientId => {
      if (clientId) {
        this.clientService.getClient(clientId, token).subscribe(response => {
          this.client = response;
        })
      }
    });
  }

  ngOnDestroy() {
    this.clientIdSubscription.unsubscribe();
  }

  changeDone() {
    this.isWorkoutDone = false;
  }

  changeNotDone() {
    this.isWorkoutNotDone = false;
  }

  saveReport() {
    const token = localStorage.getItem('token') || '';

    let done: boolean | null = this.isWorkoutDone;
    if (!this.isWorkoutDone && !this.isWorkoutNotDone) {
      done = null;
    }

    const date = new Date();
    date.setHours(date.getHours() + 1);

    const report: Report = {
      id: 0, // Wartość domyślna
      clientReport: null,
      clientReportDate: null,
      coachReport: this.reportDescription || null,
      coachReportDate: this.reportDescription ? date.toISOString() : null,
      workoutUnitId: this.data.workoutUnitId,
      workoutUnitName: '',
      workoutUnitDate: '',
      clientFirstName: '',
      clientLastName: '',
      clientEmail: this.client?.email || '',
      isWorkoutDone: done,
    };

    this.reportService.updateReport(report, token).subscribe(
      () => {
        this.dialogRef.close(report);
      }, () => {
        this.openSnackBar('Błąd, raport niedodany');
      }
    )
  }

  onScroll(event: Event): void {
    const target = event.target as HTMLElement;

    if (target) {
      this.renderer.addClass(document.body, 'show-scrollbar');

      clearTimeout(this.scrollTimeout);

      this.scrollTimeout = setTimeout(() => {
        this.renderer.removeClass(document.body, 'show-scrollbar');
      }, 3000);
    }
  }

  private openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}
