import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { Diet } from "../interfaces/Diet";

@Injectable({
  providedIn: 'root'
})
export class DietService {
  private getUrl = 'http://localhost:8080/api/diet';
  private putUrl = 'http://localhost:8080/api/diet/update'

  constructor(private http: HttpClient) {}

  getClientDiet(clientId: number, token: string): Observable<Diet> {
    const headers = this.createHeaders(token);
    return this.http.get<Diet>(`${this.getUrl}/${clientId}`, { headers: headers });
  }

  updateDiet(diet: Diet, token: string) {
    const headers = this.createHeaders(token);
    return this.http.put<Diet>(this.putUrl, diet, { headers: headers });
  }

  private createHeaders(token: string) {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
