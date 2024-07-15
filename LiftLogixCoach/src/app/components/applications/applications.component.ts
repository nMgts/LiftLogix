import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { Application } from '../../interfaces/Application';
import { ApplicationService } from '../../services/application.service';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ApplicationDetailsDialogComponent } from '../application-details-dialog/application-details-dialog.component';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit, OnChanges {
  @Input() isGrid5Expanded = false;
  applications: Application[] = [];
  displayedApplications: Application[] = [];
  showArchivedApplications = false;
  pageSize = 4;
  pageIndex = 0;
  totalApplications = 0;

  constructor(private cdr: ChangeDetectorRef, private applicationService: ApplicationService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isGrid5Expanded']) {
      this.loadApplications();
    }
  }

  async loadApplications(): Promise<void> {

    if (!this.isGrid5Expanded) {
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
    if (this.isGrid5Expanded) {
      const start = this.pageIndex * this.pageSize;
      const end = start + this.pageSize;
      this.displayedApplications = this.applications.slice(start, end);
    } else {
      this.displayedApplications = this.applications.slice(0, 3);
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateDisplayedApplications();
  }

  openApplicationDialog(event: Event, application: Application): void {
    event.stopPropagation();
    this.dialog.open(ApplicationDetailsDialogComponent, {
      data: application,
      width: '600px'
    });
  }

  accept(event: Event, applicationId: number): void {
    event.stopPropagation();
    const token = localStorage.getItem('token') || '';
    this.applicationService.acceptApplication(applicationId, token).subscribe(
      () => this.loadApplications(),
      (error: any) => console.error("Error accepting application", error)
    );
  }

  reject(event: Event, applicationId: number): void {
    event.stopPropagation();
    const token = localStorage.getItem('token') || '';
    this.applicationService.rejectApplication(applicationId, token).subscribe(
      () => this.loadApplications(),
      (error: any) => console.error("Error rejecting application", error)
    );
  }

  showArchivedApps(event: Event): void {
    event.stopPropagation();
    if (this.isGrid5Expanded) {
      this.showArchivedApplications = !this.showArchivedApplications;
      this.cdr.detectChanges();
      this.loadApplications();
    }
  }

  calculateIndex(index: number): number {
    return index + this.pageIndex * this.pageSize;
  }
}
