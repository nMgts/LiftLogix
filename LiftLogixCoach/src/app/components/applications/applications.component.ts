import { ChangeDetectorRef, Component, Input, OnChanges, HostListener, Output, EventEmitter } from '@angular/core';
import { Application } from '../../interfaces/Application';
import { ApplicationService } from '../../services/application.service';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ApplicationDetailsDialogComponent } from '../application-details-dialog/application-details-dialog.component';
import { MatSnackBar } from "@angular/material/snack-bar";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { Client } from "../../interfaces/Client";

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnChanges {
  @Input() isBoxExpanded = false;
  @Output() closeBox = new EventEmitter<void>();

  applications: Application[] = [];
  displayedApplications: Application[] = [];
  showArchivedApplications = false;
  pageSize = 10;
  pageIndex = 0;
  totalApplications = 0;
  truncateLength = 200;

  private readonly defaultImageUrl: string = '/icons/user.jpg';
  protected readonly window = window;

  constructor(
    private cdr: ChangeDetectorRef,
    private applicationService: ApplicationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer
  ) {}

  ngOnChanges(): void {
    this.loadApplications();
    this.updateTruncateLength();
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

  openApplicationDialog(application: Application, event: Event): void {
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

  accept(applicationId: number, event: Event): void {
    event.stopPropagation();
    const token = localStorage.getItem('token') || '';
    this.applicationService.acceptApplication(applicationId, token).subscribe(
      () => {
        this.loadApplications();
        this.openSnackBar('Zgłoszenie przyjęte - dodano nowego klienta');
        this.applicationService.notifyClientsQuantityUpdate();
      },
      (error: any) => console.error('Error accepting application', error)
    );
  }

  reject(applicationId: number, event: Event): void {
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

  showArchivedApps(): void {
    if (this.isBoxExpanded) {
      this.showArchivedApplications = !this.showArchivedApplications;
      this.cdr.detectChanges();
      this.loadApplications();
    }
  }

  getSafeImageUrl(client: Client): SafeUrl {
    if (client.image) {
      return this.sanitizer.bypassSecurityTrustUrl(client.image);
    } else {
      return this.sanitizer.bypassSecurityTrustUrl(this.defaultImageUrl);
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
  onResize(): void {
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

  close(event: Event) {
    event.stopPropagation();
    this.closeBox.emit();
  }
}
