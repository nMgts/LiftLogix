import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Application } from "../interfaces/Application";
import {Observable, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private getUrl = 'http://localhost:8080/api/application/mine';
  private acceptUrl = 'http://localhost:8080/api/application/accept';
  private rejectUrl = 'http://localhost:8080/api/application/reject'

  private clientsQuantityUpdatedSource = new Subject<void>();
  clientsQuantityUpdated$ = this.clientsQuantityUpdatedSource.asObservable();

  constructor(private http: HttpClient) {}

  notifyClientsQuantityUpdate() {
    this.clientsQuantityUpdatedSource.next();
  }

  getMyApplications(token: string): Observable<Application[]> {
    const headers = this.createHeaders(token);
    return this.http.get<Application[]>(this.getUrl, { headers: headers });
  }

  acceptApplication(application_id: number, token: string): Observable<void> {
    const headers = this.createHeaders(token);
    const url = `${this.acceptUrl}/${application_id}`;
    return this.http.put<void>(url, {}, { headers: headers });
  }

  rejectApplication(application_id: number, token: string): Observable<void> {
    const headers = this.createHeaders(token);
    const url = `${this.rejectUrl}/${application_id}`;
    return this.http.put<void>(url, {}, { headers: headers });
  }

  private createHeaders(token: string) {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
