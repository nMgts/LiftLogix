import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {Result} from "../interfaces/Result";

@Injectable({
  providedIn: 'root'
})
export class ResultService {
  private getUrl = 'http://localhost:8080/api/result';
  private getCurrentUrl = 'http://localhost:8080/api/result/current'

  constructor(private http: HttpClient) {}

  getAllResults(clientId: number, token: string): Observable<Result[]> {
    const headers = this.createHeaders(token);
    return this.http.get<Result[]>(`${this.getUrl}/${clientId}`, { headers: headers });
  }

  getCurrentResult(clientId: number, token: string): Observable<Result> {
    const headers = this.createHeaders(token);
    return this.http.get<Result>(`${this.getCurrentUrl}/${clientId}`, { headers: headers });
  }

  private createHeaders(token: string) {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
