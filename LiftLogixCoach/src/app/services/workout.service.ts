import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private baseUrl = 'http://localhost:8080/api/workout';
  private toggleIndividualUrl = `${this.baseUrl}/toggle-individual`;
  private setDateUrl = `${this.baseUrl}/set-date`

  constructor(private http: HttpClient) {}

  toggleIndividual(id: number, token: string): Observable<any> {
    const headers = this.createHeaders(token);
    return this.http.patch(`${this.toggleIndividualUrl}/${id}`, {}, { headers });
  }

  changeDate(id: number, newDate: string, duration: number, token: string): Observable<any> {
    const headers = this.createHeaders(token);
    const body = { id, newDate, duration };
    return this.http.put(this.setDateUrl, body, { headers });
  }

  private createHeaders(token: string) {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
