import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import { Router } from "@angular/router";
import {firstValueFrom, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:8080/api/auth';
  private registerUrl = 'http://localhost:8080/api/auth/register/coach';
  private loginUrl = 'http://localhost:8080/api/auth/login';
  private forgotPasswordUrl = 'http://localhost:8080/api/auth/forgot-password';
  private resetPasswordUrl = 'http://localhost:8080/api/auth/reset-password';

  constructor(private http: HttpClient, private readonly router: Router) {}

  async register(userData: any): Promise<any> {
    try {
      return await firstValueFrom(this.http.post<any>(this.registerUrl, userData));
    } catch (error) {
      throw error;
    }
  }

  async login(email: string, password: string): Promise<any> {
    try {
      const response = await firstValueFrom(this.http.post<any>(this.loginUrl, { email, password }));
      if (response.statusCode === 200 && (response.role === "COACH" || response.role === "ADMIN")) {
        return { success: true, token: response.token, role: response.role };
      } else {
        return { success: false, message: response.message};
      }
    } catch (error) {
      throw error;
    }
  }

  resendConfirmationEmail(email: string): Promise<any> {
    return this.http.post<any>(`${this.baseUrl}/resend-confirmation`, { email }).toPromise();
  }

  forgotPassword(email: string): Observable<void> {
    const url = `${this.forgotPasswordUrl}`;
    let params = new HttpParams().set('email', email);
    return this.http.post<void>(url, {}, { params: params });
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    const url = `${this.resetPasswordUrl}`;
    return this.http.put<void>(url, { token, newPassword });
  }

  logOut(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    }

    this.router.navigate(['/'])
      .then(success => {
        if (success) {
          console.log('Navigation to home successful');
        } else {
          console.error('Navigation to home failed');
        }
      })
      .catch(err => {
        console.error('Error during navigation', err);
      });
  }

  /***AUTHENTICATION METHODS***/
  isAuthenticated(): boolean {
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('token');
      return !!token;
    }
    return false;
  }

  isAdmin(): boolean {
    if (typeof localStorage !== 'undefined') {
      const role = localStorage.getItem('role');
      return role === 'ADMIN';
    }
    return false;
  }

  isUser(): boolean {
    if (typeof localStorage !== 'undefined') {
      const role = localStorage.getItem('role');
      return role === 'COACH';
    }
    return false;
  }
}
