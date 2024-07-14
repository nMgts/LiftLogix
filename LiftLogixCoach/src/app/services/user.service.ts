import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";
import { Router } from "@angular/router";
import {firstValueFrom, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private registerUrl = 'http://localhost:8080/api/auth/register/coach';
  private loginUrl = 'http://localhost:8080/api/auth/login';
  private resendUrl = 'http://localhost:8080/api/auth/resend-confirmation';
  private forgotPasswordUrl = 'http://localhost:8080/api/auth/forgot-password';
  private resetPasswordUrl = 'http://localhost:8080/api/auth/reset-password';
  private confirmEmailUrl = 'http://localhost:8080/api/auth/confirm';

  constructor(private http: HttpClient, private readonly router: Router) {}

  async register(userData: any): Promise<any> {
    const response = await firstValueFrom(this.http.post<any>(this.registerUrl, userData));
    if (response.statusCode === 200) {
      return { success: true }
    } else {
      return { success: false, error: response.error }
    }
  }

  async login(email: string, password: string): Promise<any> {
    const response = await firstValueFrom(this.http.post<any>(this.loginUrl, { email, password }));
    if (response.statusCode === 200 && (response.role === "COACH" || response.role === "ADMIN")) {
      return { success: true, token: response.token, refreshToken: response.refreshToken, role: response.role };
    } else {
      return { success: false, error: response.error};
    }
  }

  async resendConfirmationEmail(email: string): Promise<any> {
    return await firstValueFrom(this.http.post<any>(this.resendUrl, { email }));
  }

  async forgotPassword(email: string): Promise<any> {
    let params = new HttpParams().set('email', email);
    const response = await firstValueFrom(this.http.post<any>(this.forgotPasswordUrl, {}, {params: params}));
    if (response.statusCode === 200) {
      return { success: true };
    } else {
      return { success: false };
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<any> {
    const response = await firstValueFrom(this.http.put<any>(this.resetPasswordUrl, { token, newPassword }));
    if (response.statusCode === 200) {
      return { success: true };
    } else {
     return { success: false }
    }
  }

  confirmEmail(token: string): Observable<string> {
    let params = new HttpParams().set('token', token);
    return this.http.put(this.confirmEmailUrl, {}, { params: params, responseType: 'text' });
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
