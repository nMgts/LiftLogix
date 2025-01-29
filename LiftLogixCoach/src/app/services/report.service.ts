import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import { Report } from "../interfaces/Report";

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private baseUrl = 'http://localhost:8080/api/report';
  private getAllUrl = 'http://localhost:8080/api/report/all';
  private findByWorkoutUnitIdUrl = 'http://localhost:8080/api/report/wu';
  private updateUrl = 'http://localhost:8080/api/report/update';
  private deleteUrl = 'http://localhost:8080/api/report/delete';

  constructor(private http: HttpClient) {}

  getAllReports(token: string): Observable<Report[]> {
    const headers = this.createHeaders(token);
    return this.http.get<Report[]>(this.getAllUrl, { headers });
  }

  getReportById(reportId: number, token: string): Observable<Report> {
    const headers = this.createHeaders(token);
    return this.http.get<Report>(`${this.baseUrl}/${reportId}`, { headers });
  }

  findByWorkoutUnitId(wuId: number, token: string): Observable<Report> {
    const headers = this.createHeaders(token);
    return this.http.get<Report>(`${this.findByWorkoutUnitIdUrl}/${wuId}`, { headers });
  }

  updateReport(report: Report, token: string): Observable<Report> {
    const headers = this.createHeaders(token);
    return this.http.put<Report>(this.updateUrl, report, { headers });
  }

  deleteReport(reportId: number, token: string): Observable<any> {
    const headers = this.createHeaders(token);
    return this.http.delete(`${this.deleteUrl}/${reportId}`, { headers });
  }

  private createHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }
}
