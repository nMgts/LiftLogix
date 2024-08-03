import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { Exercise } from "../interfaces/Exercise";

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private getUrl = 'http://localhost:8080/api/exercise/all';
  private addUrl = 'http://localhost:8080/api/exercise/add';

  constructor(private http: HttpClient) {}

  getExercises(token: string): Observable<Exercise[]> {
    const headers = this.createHeaders(token);
    return this.http.get<Exercise[]>(this.getUrl, { headers: headers });
  }

  addExercise(token: string, data: FormData): Observable<any> {
    const headers = this.createHeaders(token);
    return this.http.post<void>(this.addUrl, data, { headers: headers });
  }

  private createHeaders(token: string) {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
