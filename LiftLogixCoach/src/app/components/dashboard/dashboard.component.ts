import {Component, OnInit} from '@angular/core';
import {Application} from "../../interfaces/Application";
import {ApplicationService} from "../../services/application.service";
import {ApplicationDetailsDialogComponent} from "../application-details-dialog/application-details-dialog.component";
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  applications: Application[] = [];

  constructor(private applicationService: ApplicationService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  async loadApplications(): Promise<void> {
    this.applicationService.getMyApplications().subscribe(
      (applications: Application[]) => {
        this.applications = applications.filter(app => app.status === 'PENDING');
      },
      (error: any) => {
        console.error('Error loading applicaitons', error);
      }
    );
  }

  openApplicationDialog(application: Application): void {
    this.dialog.open(ApplicationDetailsDialogComponent, {
      data: application,
      width: '600px'
    });
  }
  accept(applicationId: number): void {
    this.applicationService.acceptApplication(applicationId).subscribe(
      () => this.loadApplications(),
      (error: any) => console.error("Error accepting application", error)
    );
  }

  reject(applicationId: number): void {
    this.applicationService.rejectApplication(applicationId).subscribe(
      () => this.loadApplications(),
      (error: any) => console.error("Error rejecting application", error)
    );
  }

  redirectToAllApplications(): void {

  }

}
