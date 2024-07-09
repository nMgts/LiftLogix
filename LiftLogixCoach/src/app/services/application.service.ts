import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Application} from "../interfaces/Application";
import {firstValueFrom, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private getUrl = 'http://localhost:8080/api/application/mine';
  private acceptUrl = 'http://localhost:8080/api/application/accept';
  private rejectUrl = 'http://localhost:8080/api/application/reject'
  private readonly headers;

  constructor(private http: HttpClient) {
    const token: string | null = localStorage.getItem('token');
    this.headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    })
  }

  getMyApplications(): Observable<Application[]> {
    const url = `${this.getUrl}`;
    return this.http.get<Application[]>(url, { headers: this.headers });
  }

  acceptApplication(application_id: number): Observable<void> {
    const url = `${this.acceptUrl}/${application_id}`;
    return this.http.put<void>(url, {}, { headers: this.headers });
  }

  rejectApplication(application_id: number): Observable<void> {
    const url = `${this.rejectUrl}/${application_id}`;
    return this.http.put<void>(url, {}, { headers: this.headers });
  }
}
