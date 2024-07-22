import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges, HostListener
} from '@angular/core';
import { Application } from '../../interfaces/Application';
import { ApplicationService } from '../../services/application.service';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ApplicationDetailsDialogComponent } from '../application-details-dialog/application-details-dialog.component';
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit, OnChanges {
  @Input() isBoxExpanded = false;
  applications: Application[] = [];
  displayedApplications: Application[] = [];
  showArchivedApplications = false;
  pageSize = 10;
  pageIndex = 0;
  totalApplications = 0;
  truncateLength = 200;

  constructor(
    private cdr: ChangeDetectorRef,
    private applicationService: ApplicationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadApplications();
    this.updateTruncateLength();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isBoxExpanded']) {
      this.loadApplications();
      this.updateTruncateLength();
    }
  }

  async loadApplications() {

    if (!this.isBoxExpanded) {
      this.showArchivedApplications = false;
    }
    const token = localStorage.getItem('token') || '';
    this.applicationService.getMyApplications(token).subscribe(
      (applications: Application[]) => {
        this.applications = applications.filter(app => app.status === 'PENDING' || this.showArchivedApplications);
        this.totalApplications = this.applications.length;
        this.updateDisplayedApplications();
      },
      (error: any) => {
        console.error('Error loading applications', error);
      }
    );
  }

  updateDisplayedApplications(): void {
    if (this.isBoxExpanded) {
      const start = this.pageIndex * this.pageSize;
      const end = start + this.pageSize;
      this.displayedApplications = this.applications.slice(start, end);
    } else {
      this.displayedApplications = this.applications.slice(0, 5);
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateDisplayedApplications();
  }

  openApplicationDialog(event: Event, application: Application): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(ApplicationDetailsDialogComponent, {
      data: application,
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.loadApplications();
      this.updateTruncateLength();
    });
  }

  accept(event: Event, applicationId: number): void {
    event.stopPropagation();
    const token = localStorage.getItem('token') || '';
    this.applicationService.acceptApplication(applicationId, token).subscribe(
      () => {
        this.loadApplications();
        this.openSnackBar('Zgłoszenie przyjęte - dodano nowego klienta');
      },
      (error: any) => console.error('Error accepting application', error)
    );
  }

  reject(event: Event, applicationId: number): void {
    event.stopPropagation();
    const token = localStorage.getItem('token') || '';
    this.applicationService.rejectApplication(applicationId, token).subscribe(
      () => {
        this.loadApplications();
        this.openSnackBar('Zgłoszenie odrzucone');
      },
      (error: any) => console.error('Error rejecting application', error)
    );
  }

  showArchivedApps(event: Event): void {
    event.stopPropagation();
    if (this.isBoxExpanded) {
      this.showArchivedApplications = !this.showArchivedApplications;
      this.cdr.detectChanges();
      this.loadApplications();
    }
  }

  calculateIndex(index: number): number {
    return index + this.pageIndex * this.pageSize;
  }

  private openSnackBar(message: string): void {
    this.snackBar.open(message, 'Zamknij', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }


  /** Truncate text methods */

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.updateTruncateLength();
  }

  updateTruncateLength(): void {
    const width = window.innerWidth;
    if (width > 1200) {
      this.truncateLength = 600;
    } else if (width > 800) {
      this.truncateLength = 400;
    } else {
      this.truncateLength = 200;
    }
    this.cdr.detectChanges();
  }

  truncateDescription(description: string): string {
    if (description.length > this.truncateLength) {
      return description.substring(0, this.truncateLength) + '...';
    }
    return description;
  }
}
