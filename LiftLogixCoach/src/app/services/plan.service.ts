import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Plan} from "../interfaces/Plan";
import {Observable} from "rxjs";
import {BasicPlan} from "../interfaces/BasicPlan";

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  private saveUrl = 'http://localhost:8080/api/plans/save';
  private getMyUrl = 'http://localhost:8080/api/plans/my';
  private getPublicUrl = 'http://localhost:8080/api/plans/public';
  private getDetailsUrl = 'http://localhost:8080/api/plans/details';

  constructor(private http: HttpClient) {}

  createPlan(plan: Plan, token: string): Observable<Plan> {
    const headers = this.createHeaders(token);
    return this.http.post<Plan>(this.saveUrl, plan, { headers: headers });
  }

  getMyPlans(token: string): Observable<BasicPlan[]> {
    const headers = this.createHeaders(token);
    return this.http.get<BasicPlan[]>(this.getMyUrl, { headers: headers });
  }

  getPublicPlans(token: string): Observable<BasicPlan[]> {
    const headers = this.createHeaders(token);
    return this.http.get<BasicPlan[]>(this.getPublicUrl, { headers: headers });
  }

  getPlanDetails(planId: number, token: string): Observable<Plan> {
    const headers = this.createHeaders(token);
    return this.http.get<Plan>(`${this.getDetailsUrl}/${planId}`, { headers: headers });
  }

  private createHeaders(token: string) {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
