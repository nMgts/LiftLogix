import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {Coach} from "../interfaces/Coach";
import {Application} from "../interfaces/Application";

@Injectable({
  providedIn: 'root'
})
export class CoachService {
  private profileUrl = 'http://localhost:8080/api/coach/profile'
  private sendCodeUrl = 'http://localhost:8080/api/auth/send-verification-code'
  private verifyUrl = 'http://localhost:8080/api/verification/verify';
  private updateEmailUrl = 'http://localhost:8080/api/auth/update-email';
  private checkPasswordUrl = 'http://localhost:8080/api/verification/check';
  private updatePasswordUrl = 'http://localhost:8080/api/user/change-password'

  constructor(private http: HttpClient) {}

  getProfile(token: string): Observable<Coach> {
    const headers = this.createHeaders(token);
    return this.http.get<Coach>(this.profileUrl, { headers: headers });
  }

  updateProfile(coach: Coach, token: string): Observable<Coach> {
    const headers = this.createHeaders(token);
    return this.http.put<Coach>(this.profileUrl, coach, { headers: headers });
  }

  sendVerificationCode(email: string, token: string): Observable<void> {
    const headers = this.createHeaders(token);
    return this.http.post<void>(this.sendCodeUrl, { email }, { headers: headers })
  }

  verifyCode(email: string, code: string, token: string): Observable<void> {
    const headers = this.createHeaders(token);
    return this.http.post<void>(this.verifyUrl, { email, code }, { headers: headers })
  }

  updateEmail(currentEmail: string, newEmail: string, verificationCode: string, token: string): Observable<void> {
    const headers = this.createHeaders(token);
    return this.http.put<void>(this.updateEmailUrl, { currentEmail, newEmail, verificationCode }, { headers: headers });
  }

  checkPassword(password: string, token: string): Observable<void> {
    const headers = this.createHeaders(token);
    let params = new HttpParams().set('password', password);
    return this.http.get<void>(this.checkPasswordUrl, { headers: headers, params: params });
  }

  updatePassword(password: string, token: string): Observable<void> {
    const headers = this.createHeaders(token);
    let params = new HttpParams().set('password', password);
    return this.http.put<void>(this.updatePasswordUrl, {}, {  headers: headers, params: params });
  }

  private createHeaders(token: string) {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
