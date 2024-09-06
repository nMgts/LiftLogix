import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import { Observable } from "rxjs";
import { PersonalPlan } from "../interfaces/PersonalPlan";
import { Plan } from "../interfaces/Plan";
import {formatDate} from "@angular/common";
import {BasicPersonalPlan} from "../interfaces/BasicPersonalPlan";

@Injectable({
  providedIn: 'root'
})
export class PersonalPlanService {
  private getActiveUrl = 'http://localhost:8080/api/personal-plan/is-active';
  private getAllByClientUrl = 'http://localhost:8080/api/personal-plan/all'
  private getDetailsUrl = 'http://localhost:8080/api/personal-plan/details'
  private deactivateUrl = 'http://localhost:8080/api/personal-plan/deactivate';
  private createUrl = 'http://localhost:8080/api/personal-plan/create';
  private deleteUrl = 'http://localhost:8080/api/personal-plan/delete'

  constructor(private http: HttpClient) {}

  getActivePlan(clientId: number, token: string): Observable<PersonalPlan> {
    const headers = this.createHeaders(token);
    return this.http.get<PersonalPlan>(`${this.getActiveUrl}/${clientId}`, { headers: headers});
  }

  getClientPlans(clientId: number, token: string): Observable<BasicPersonalPlan[]> {
    const headers = this.createHeaders(token);
    return this.http.get<BasicPersonalPlan[]>(`${this.getAllByClientUrl}/${clientId}`, { headers: headers });
  }

  getPlanDetails(planId: number, token: string): Observable<PersonalPlan> {
    const headers = this.createHeaders(token);
    return this.http.get<PersonalPlan>(`${this.getDetailsUrl}/${planId}`, { headers: headers });
  }

  deactivatePlan(planId: number, token: string): Observable<any> {
    const headers = this.createHeaders(token);
    return this.http.patch(`${this.deactivateUrl}/${planId}`, '', { headers: headers });
  }

  createPlan(personalPlan: PersonalPlan, token: string): Observable<any> {
    const headers = this.createHeaders(token);
    return this.http.post<PersonalPlan>(this.createUrl, personalPlan, { headers: headers});
  }

  deletePlan(planId: number, token: string): Observable<any> {
    const headers = this.createHeaders(token);
    return this.http.delete(`${this.deleteUrl}/${planId}`, { headers: headers });
  }

  private createHeaders(token: string) {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
