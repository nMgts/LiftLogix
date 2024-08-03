import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {Result} from "../interfaces/Result";

@Injectable({
  providedIn: 'root'
})
export class ResultService {
  private getUrl = 'http://localhost:8080/api/result';
  private getCurrentUrl = 'http://localhost:8080/api/result/current'
  private addUrl = 'http://localhost:8080/api/result/add';

  constructor(private http: HttpClient) {}

  getAllResults(clientId: number, token: string): Observable<Result[]> {
    const headers = this.createHeaders(token);
    return this.http.get<Result[]>(`${this.getUrl}/${clientId}`, { headers: headers });
  }

  getCurrentResult(clientId: number, token: string): Observable<Result> {
    const headers = this.createHeaders(token);
    return this.http.get<Result>(`${this.getCurrentUrl}/${clientId}`, { headers: headers });
  }

  addResult(clientId: number, token: string, benchpress: number | null, deadlift: number | null, squat: number | null): Observable<any> {
    const headers = this.createHeaders(token);
    let params = new HttpParams();
    if (benchpress) params = params.set('benchpress', benchpress.toString());
    if (deadlift) params = params.set('deadlift', deadlift.toString());
    if (squat) params = params.set('squat', squat.toString());

    return this.http.post(`${this.addUrl}/${clientId}`, null, { params, headers });
  }

  private createHeaders(token: string) {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
