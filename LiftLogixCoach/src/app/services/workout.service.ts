import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { WorkoutUnit } from "../interfaces/WorkoutUnit";

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private baseUrl = 'http://localhost:8080/api/workout';
  private toggleIndividualUrl = `${this.baseUrl}/toggle-individual`;
  private setDateUrl = `${this.baseUrl}/set-date`
  private editWorkoutUrl = `${this.baseUrl}/update`

  constructor(private http: HttpClient) {}

  getWorkout(id: number, token: string): Observable<WorkoutUnit> {
    const headers = this.createHeaders(token);
    return this.http.get<WorkoutUnit>(`${this.baseUrl}/${id}`, { headers });
  }

  toggleIndividual(id: number, token: string): Observable<any> {
    const headers = this.createHeaders(token);
    return this.http.patch(`${this.toggleIndividualUrl}/${id}`, {}, { headers });
  }

  changeDate(id: number, newDate: string, duration: number, token: string): Observable<any> {
    const headers = this.createHeaders(token);
    const body = { id, newDate, duration };
    return this.http.put(this.setDateUrl, body, { headers });
  }

  editWorkout(workout: WorkoutUnit, token: string): Observable<WorkoutUnit> {
    const headers = this.createHeaders(token);
    return this.http.put<WorkoutUnit>(this.editWorkoutUrl, workout, { headers })
  }

  private createHeaders(token: string) {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
