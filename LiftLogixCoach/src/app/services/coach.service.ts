import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {Coach} from "../interfaces/Coach";
import {Application} from "../interfaces/Application";

@Injectable({
  providedIn: 'root'
})
export class CoachService {
  private baseUrl = 'http://localhost:8080/api/coach';
  private sendCodeUrl = 'http://localhost:8080/api/auth/send-verification-code'
  private verifyUrl = 'http://localhost:8080/api/verification/verify';
  private updateEmailUrl = 'http://localhost:8080/api/auth/update-email';
  private readonly headers;

  constructor(private http: HttpClient) {
    const token: string | null = localStorage.getItem('token');
    this.headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    })
  }

  getProfile(): Observable<Coach> {
    const url = `${this.baseUrl}/profile`;
    return this.http.get<Coach>(url, { headers: this.headers });
  }

  updateProfile(coach: Coach): Observable<Coach> {
    const url = `${this.baseUrl}/profile`;
    return this.http.put<Coach>(url, coach, { headers: this.headers });
  }

  sendVerificationCode(email: string): Observable<void> {
    const url = `${this.sendCodeUrl}`;
    return this.http.post<void>(url, { email }, { headers: this.headers })
  }

  verifyCode(email: string, code: string): Observable<void> {
    const url = `${this.verifyUrl}`;
    return this.http.post<void>(url, { email, code }, { headers: this.headers })
  }

  updateEmail(currentEmail: string, newEmail: string, verificationCode: string): Observable<any> {
    const url = `${this.updateEmailUrl}`;
    return this.http.put<any>(url, { currentEmail, newEmail, verificationCode }, { headers: this.headers });
  }
}
