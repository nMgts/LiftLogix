import { Component, EventEmitter, HostListener, Input, OnChanges, Output } from '@angular/core';
import { ReportService } from "../../services/report.service";
import { Report } from "../../interfaces/Report";
import { PageEvent } from '@angular/material/paginator';
import { DeleteReportDialogComponent } from "../delete-report-dialog/delete-report-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import {ReportDetailsDialogComponent} from "../report-details-dialog/report-details-dialog.component";

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnChanges {
  @Input() isBoxExpanded = false;
  @Output() closeBox = new EventEmitter<void>();
  protected readonly window = window;

  reports: Report[] = [];
  filteredReports: Report[] = [];
  searchValue: string = '';
  startDate: Date | null = null;
  endDate: Date | null = null;

  currentPage: number = 0;
  pageSize: number = 10;
  length: number = 0;

  constructor(
    private dialog: MatDialog,
    private reportService: ReportService
  ) {}

  ngOnChanges() {
    this.loadReports();
  }

  loadReports(): void {
    const token = localStorage.getItem('token') || '';
    this.reportService.getAllReports(token).subscribe({
      next: (data) => {
        this.reports = data;
        this.length = data.length;
        this.adjustPageSize();
        this.applyFilters();
      },
      error: (err) => console.error(err)
    });
  }

  openReportDetailsDialog(report: Report) {
    const dialogRef = this.dialog.open(ReportDetailsDialogComponent, {
      width: '600px',
      data: report
    });

    dialogRef.afterClosed().subscribe(() => {
      this.loadReports();
    });
  }

  openDeleteDialog(report: Report, event: Event) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(DeleteReportDialogComponent, {
      width: '300px',
      data: {
        clientReport: report.clientReport !== null,
        coachReport: report.coachReport !== null,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.deleteClientReport && result.deleteCoachReport) {
          this.deleteReport(report.id);
        } else if (result.deleteClientReport) {
          this.deleteClientReport(report);
        } else if (result.deleteCoachReport) {
          this.deleteCoachReport(report);
        }
      }
    });
  }

  deleteReport(id: number): void {
    const token = localStorage.getItem('token') || '';
    this.reportService.deleteReport(id, token).subscribe(() => {
      this.loadReports();
    }, error => {
      console.error('Błąd usuwania raportu', error);
    });
  }

  deleteClientReport(report: Report) {
    const token = localStorage.getItem('token') || '';
    report.clientReport = null;
    report.clientReportDate = null;
    this.reportService.updateReport(report, token).subscribe(() => {
      this.loadReports();
    }, error => {
      console.error('Błąd usuwania raportu', error);
    });
  }

  deleteCoachReport(report: Report) {
    const token = localStorage.getItem('token') || '';
    report.coachReport = null;
    report.coachReportDate = null;
    this.reportService.updateReport(report, token).subscribe(() => {
      this.loadReports();
    }, error => {
      console.error('Błąd usuwania raportu', error);
    });
  }

  applyFilters(): void {
    const filteredReports = this.reports.filter((report) => {
      const reportDate = new Date(report.workoutUnitDate);

      const matchesClient =
        [report.clientFirstName, report.clientLastName, report.clientEmail]
          .some((field) => field.toLowerCase().includes(this.searchValue.toLowerCase()));

      const matchesDate =
        (!this.startDate || reportDate >= this.startDate) &&
        (!this.endDate || reportDate <= this.endDate);

      return matchesClient && matchesDate;
    });
    this.length = filteredReports.length;

    this.filteredReports = filteredReports.slice(this.currentPage * this.pageSize, (this.currentPage + 1) * this.pageSize);

    console.log('Filtered reports:', this.filteredReports);
  }

  onSearchChange(event: Event): void {
    this.searchValue = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  onDateRangeChange(): void {
    this.applyFilters();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.applyFilters();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.adjustPageSize();
  }

  private adjustPageSize(): void {
    const containerWidth = document.querySelector('.report-list')?.clientWidth || 0;
    let minItemWidth = 310;
    if (window.innerWidth < 471) {
      minItemWidth = 250;
    }

    const columns = Math.floor(containerWidth / minItemWidth);
    this.pageSize = columns * 3;
    if (this.pageSize == 0) {
      this.pageSize = 3;
    }

    this.applyFilters();
  }

  close(event: Event) {
    event.stopPropagation();
    this.closeBox.emit();
  }
}
