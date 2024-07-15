import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {Coach} from "../interfaces/Coach";
import {Application} from "../interfaces/Application";

@Injectable({
  providedIn: 'root'
})
export class CoachService {
  private profileUrl = 'http://localhost:8080/api/coach/profile';

  constructor(private http: HttpClient) {}

  getProfile(token: string): Observable<Coach> {
    const headers = this.createHeaders(token);
    return this.http.get<Coach>(this.profileUrl, { headers: headers });
  }

  updateProfile(coach: Coach, token: string): Observable<Coach> {
    const headers = this.createHeaders(token);
    return this.http.put<Coach>(this.profileUrl, coach, { headers: headers });
  }

  private createHeaders(token: string) {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
