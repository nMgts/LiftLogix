import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { Exercise } from "../interfaces/Exercise";

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private defaultUrl = 'http://localhost:8080/api/exercise';
  private getUrl = 'http://localhost:8080/api/exercise/all';

  constructor(private http: HttpClient) {}

  getExercises(token: string): Observable<Exercise[]> {
    const headers = this.createHeaders(token);
    return this.http.get<Exercise[]>(this.getUrl, { headers: headers });
  }

  getExerciseImage(exerciseId: string, token: string): Observable<Blob> {
    const headers = this.createHeaders(token);
    return this.http.get(`${this.defaultUrl}/${exerciseId}`, { headers: headers, responseType: 'blob' });
  }

  private createHeaders(token: string) {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
