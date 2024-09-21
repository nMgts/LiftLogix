import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { CoachScheduler } from "../interfaces/CoachScheduler";

@Injectable({
  providedIn: 'root'
})
export class CoachSchedulerService {
  private baseUrl = 'http://localhost:8080/api/scheduler';

  constructor(private http: HttpClient) {}

  getScheduler(token: string): Observable<CoachScheduler> {
    const headers = this.createHeaders(token);
    return this.http.get<CoachScheduler>(this.baseUrl, { headers: headers });
  }

  private createHeaders(token: string) {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
