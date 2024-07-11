import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
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
  private checkPasswordUrl = 'http://localhost:8080/api/verification/check';
  private updatePasswordUrl = 'http://localhost:8080/api/user/change-password'
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

  updateEmail(currentEmail: string, newEmail: string, verificationCode: string): Observable<void> {
    const url = `${this.updateEmailUrl}`;
    return this.http.put<void>(url, { currentEmail, newEmail, verificationCode }, { headers: this.headers });
  }

  checkPassword(password: string): Observable<void> {
    const url = `${this.checkPasswordUrl}`;
    let params = new HttpParams().set('password', password);
    return this.http.get<void>(url, { headers: this.headers, params: params });
  }

  updatePassword(password: string): Observable<void> {
    let params = new HttpParams().set('password', password);
    const url = `${this.updatePasswordUrl}`;
    console.log(url);
    return this.http.put<void>(url, {}, {  headers: this.headers, params: params });
  }
}
