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
    try {
      this.applications = await this.applicationService.getMyApplications();
    } catch (error) {
      console.error('Error loading applications', error);
    }
  }

  viewMore(applicationId: number): void {

  }

  accept(applicationId: number): void {

  }

  reject(applicationId: number): void {

  }

  redirectToAllApplications(): void {

  }

}
