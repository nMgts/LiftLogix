import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import { Observable } from "rxjs";
import { Exercise } from "../interfaces/Exercise";

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private baseUrl = 'http://localhost:8080/api/exercise';
  private getUrl = 'http://localhost:8080/api/exercise/all';
  private searchByAliasUrl = 'http://localhost:8080/api/exercise/searchByAlias';
  private addUrl = 'http://localhost:8080/api/exercise/add';

  constructor(private http: HttpClient) {}

  getExercises(token: string): Observable<Exercise[]> {
    const headers = this.createHeaders(token);
    return this.http.get<Exercise[]>(this.getUrl, { headers: headers });
  }

  getExerciseDetails(exerciseId: number, token: string): Observable<Exercise> {
    const headers = this.createHeaders(token);
    return this.http.get<Exercise>(`${this.baseUrl}/${exerciseId}`, { headers: headers });
  }

  addExercise(token: string, data: FormData): Observable<any> {
    const headers = this.createHeaders(token);
    return this.http.post<void>(this.addUrl, data, { headers: headers });
  }

  getFilteredExercisesByAlias(token: string, alias: string): Observable<Exercise[]> {
    const headers = this.createHeaders(token);
    const params = new HttpParams().set('alias', alias);
    return this.http.get<Exercise[]>(this.searchByAliasUrl, { headers, params });
  }

  private createHeaders(token: string) {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
