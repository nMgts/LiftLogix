import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { Plan } from "../interfaces/Plan";
import { Observable, tap } from "rxjs";
import { BasicPlan } from "../interfaces/BasicPlan";
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  private saveUrl = 'http://localhost:8080/api/plans/save';
  private getMyUrl = 'http://localhost:8080/api/plans/my';
  private getPublicUrl = 'http://localhost:8080/api/plans/public';
  private getDetailsUrl = 'http://localhost:8080/api/plans/details';
  private deleteUrl = 'http://localhost:8080/api/plans/delete';
  private addToMyPlansUrl = 'http://localhost:8080/api/plans/add-to-my-plans';
  private editPlanUrl = 'http://localhost:8080/api/plans/edit';
  private renamePlanUrl = 'http://localhost:8080/api/plans/rename';
  private changePlanVisibilityUrl = 'http://localhost:8080/api/plans/visibility';
  private exportUrl = 'http://localhost:8080/api/plans/export';
  private duplicateUrl = 'http://localhost:8080/api/plans/copy';

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

  deletePlan(planId: number, token: string): Observable<any> {
    const headers = this.createHeaders(token);
    return this.http.delete(`${this.deleteUrl}/${planId}`, { headers: headers });
  }

  addToMyPlans(planId: number, token: string): Observable<any> {
    const headers = this.createHeaders(token);
    return this.http.put(`${this.addToMyPlansUrl}/${planId}`, '', { headers: headers })
  }

  editPlan(plan: Plan, token: string): Observable<Plan> {
    const headers = this.createHeaders(token);
    return this.http.put<Plan>(this.editPlanUrl, plan, { headers: headers })
  }

  renamePlan(planId: number, newName: string, token: string): Observable<any> {
    const headers = this.createHeaders(token);
    return this.http.patch(`${this.renamePlanUrl}/${planId}`, newName, { headers: headers, responseType: 'text' });
  }

  changePlanVisibility(planId: number, visibility: boolean, token: string): Observable<any> {
    const headers = this.createHeaders(token);
    return this.http.patch(`${this.changePlanVisibilityUrl}/${planId}`, visibility, { headers: headers, responseType: 'text' });
  }

  exportPlanToExcel(planId: number, token: string): Observable<any> {
    const headers = this.createHeaders(token);
    return this.http.get(`${this.exportUrl}/${planId}`, {
      headers: headers,
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      tap((response: HttpResponse<Blob>) => {
        const contentDisposition = response.headers.get('Content-Disposition');
        const filename = this.extractFilename(contentDisposition);

        if (response.body) {
          saveAs(response.body, filename);
        } else {
          console.error('Error: response.body is null');
        }
      })
    );
  }

  duplicatePlan(id: number, token: string): Observable<string> {
    const headers = this.createHeaders(token);
    return this.http.post<string>(`${this.duplicateUrl}/${id}`, '', { headers: headers });
  }

  private extractFilename(contentDisposition: string | null): string {
    console.log(contentDisposition)
    if (!contentDisposition) {
      return 'plan.xls';
    }
    const matches = /filename\*=UTF-8''(.+)|filename="([^"]+)"|filename=(\S+)/.exec(contentDisposition);

    if (matches) {
      return decodeURIComponent(matches[1] || matches[2] || matches[3]);
    }

    return 'plan.xls';
  }

  private createHeaders(token: string) {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
