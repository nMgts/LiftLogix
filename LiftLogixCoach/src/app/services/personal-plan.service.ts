import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import { Observable } from "rxjs";
import { PersonalPlan } from "../interfaces/PersonalPlan";
import { Plan } from "../interfaces/Plan";
import {formatDate} from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class PersonalPlanService {
  private getActiveUrl = 'http://localhost:8080/api/personal-plan/is-active';
  private deactivateUrl = 'http://localhost:8080/api/personal-plan/deactivate';
  private createUrl = 'http://localhost:8080/api/personal-plan/create';

  constructor(private http: HttpClient) {}

  getActivePlan(clientId: number, token: string): Observable<PersonalPlan> {
    const headers = this.createHeaders(token);
    return this.http.get<PersonalPlan>(`${this.getActiveUrl}/${clientId}`, { headers: headers});
  }

  deactivatePlan(planId: number, token: string): Observable<any> {
    const headers = this.createHeaders(token);
    return this.http.patch(`${this.deactivateUrl}/${planId}`, '', { headers: headers });
  }

  createPlan(plan: Plan, clientId: number, date: string, token: string): Observable<any> {
    const headers = this.createHeaders(token);
    const formattedDate = formatDate(new Date(date), 'yyyy-MM-dd', 'en');
    let params = new HttpParams()
      .set('clientId', clientId.toString())
      .set('startDate', formattedDate);

    return this.http.post<PersonalPlan>(this.createUrl, plan, { params: params, headers: headers});
  }

  private createHeaders(token: string) {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
