import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Application} from "../../interfaces/Application";
import {ApplicationService} from "../../services/application.service";
import {ApplicationDetailsDialogComponent} from "../application-details-dialog/application-details-dialog.component";
import { MatDialog } from '@angular/material/dialog';
import {PageEvent} from "@angular/material/paginator";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  applications: Application[] = [];
  displayedApplications: Application[] = [];
  isGrid5Expanded = false;
  showArchivedApplications = false;
  pageSize = 5;
  pageIndex = 0;
  totalApplications = 10;

  constructor(private cdr: ChangeDetectorRef, private applicationService: ApplicationService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  async loadApplications(): Promise<void> {
    this.applicationService.getMyApplications().subscribe(
      (applications: Application[]) => {
        this.applications = applications.filter(app => app.status === 'PENDING' || this.showArchivedApplications);
        this.updateDisplayedApplications();
      },
      (error: any) => {
        console.error('Error loading applicaitons', error);
      }
    );
  }

  updateDisplayedApplications(): void {
    const maxApplicationsToShow = this.isGrid5Expanded ? this.totalApplications : 3;
    this.displayedApplications = this.applications.slice(0, maxApplicationsToShow);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.cdr.detectChanges();
    this.updateDisplayedApplications()
    this.loadApplications();
    this.cdr.detectChanges();
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
    this.applicationService.acceptApplication(applicationId).subscribe(
      () => this.loadApplications(),
      (error: any) => console.error("Error accepting application", error)
    );
  }

  reject(event: Event, applicationId: number): void {
    event.stopPropagation();
    this.applicationService.rejectApplication(applicationId).subscribe(
      () => this.loadApplications(),
      (error: any) => console.error("Error rejecting application", error)
    );
  }
  toggleGrid5Expanded(event: Event): void {
    event.stopPropagation();
    this.isGrid5Expanded = !this.isGrid5Expanded;

    if (!this.isGrid5Expanded) {
      this.showArchivedApplications = false;
    }
    this.updateDisplayedApplications();

    const gridsToToggle = document.querySelectorAll('.wrapper > div:not(.grid5)');
    gridsToToggle.forEach(grid => grid.classList.toggle('fade-out'));
  }

  showArchivedApps(event: Event): void {
    event.stopPropagation();
    this.showArchivedApplications = !this.showArchivedApplications;
    this.cdr.detectChanges();
    this.loadApplications();
  }
}
