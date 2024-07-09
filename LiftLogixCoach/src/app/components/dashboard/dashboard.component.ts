import {Component, OnInit} from '@angular/core';
import {Application} from "../../interfaces/Application";
import {Client} from "../../interfaces/Client";
import {ApplicationService} from "../../services/application.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  applications: Application[] = [];

  constructor(private applicationService: ApplicationService) {}

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

  viewMore(applicationId: number): void {

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
