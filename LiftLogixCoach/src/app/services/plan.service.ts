import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Plan} from "../interfaces/Plan";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  private saveUrl = 'http://localhost:8080/api/plans/save';
  private getMyUrl = 'http://localhost:8080/api/plans/my';
  private getPublicUrl = 'http://localhost:8080/api/plans/public';

  constructor(private http: HttpClient) {}

  createPlan(plan: Plan, token: string): Observable<Plan> {
    const headers = this.createHeaders(token);
    return this.http.post<Plan>(this.saveUrl, plan, { headers: headers });
  }

  getMyPlans(token: string): Observable<Plan[]> {
    const headers = this.createHeaders(token);
    return this.http.get<Plan[]>(this.getMyUrl, { headers: headers });
  }

  getPublicPlans(token: string): Observable<Plan[]> {
    const headers = this.createHeaders(token);
    return this.http.get<Plan[]>(this.getPublicUrl, { headers: headers });
  }

  private createHeaders(token: string) {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
