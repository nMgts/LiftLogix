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

  toggleIndividual(id: number, date: string, token: string): Observable<any> {
    const headers = this.createHeaders(token);
    const url = `${this.toggleIndividualUrl}/${id}?date=${encodeURIComponent(date)}`;
    return this.http.patch(url, {}, { headers });
  }

  changeDate(id: number, oldDate: string, newDate: string, token: string): Observable<any> {
    const headers = this.createHeaders(token);
    const body = { id, oldDate, newDate };
    return this.http.put(this.setDateUrl, body, { headers });
  }

  private createHeaders(token: string) {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
