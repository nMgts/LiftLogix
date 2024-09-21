import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable} from "rxjs";
import { Result } from "../interfaces/Result";

@Injectable({
  providedIn: 'root'
})
export class ResultService {
  private getUrl = 'http://localhost:8080/api/result';
  private getCurrentUrl = 'http://localhost:8080/api/result/current'
  private addUrl = 'http://localhost:8080/api/result/add';
  private updateUrl = 'http://localhost:8080/api/result/update';
  private deleteUrl = 'http://localhost:8080/api/result/delete';

  constructor(private http: HttpClient) {}

  getAllResults(clientId: number, token: string): Observable<Result[]> {
    const headers = this.createHeaders(token);
    return this.http.get<Result[]>(`${this.getUrl}/${clientId}`, { headers: headers });
  }

  getCurrentResult(clientId: number, token: string): Observable<Result> {
    const headers = this.createHeaders(token);
    return this.http.get<Result>(`${this.getCurrentUrl}/${clientId}`, { headers: headers });
  }

  addResult(clientId: number, token: string, result: Result): Observable<any> {
    const headers = this.createHeaders(token);
    return this.http.post(`${this.addUrl}/${clientId}`, result, {  headers: headers });
  }

  updateResult(result: Result, token: string): Observable<any> {
    const headers = this.createHeaders(token);
    return this.http.put<Result>(this.updateUrl, result, { headers: headers });
  }

  deleteResult(resultId: number, token: string): Observable<any> {
    const headers = this.createHeaders(token);
    const url = `${this.deleteUrl}?id=${resultId}`;

    return this.http.delete(url, { headers: headers });
  }

  private createHeaders(token: string) {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
