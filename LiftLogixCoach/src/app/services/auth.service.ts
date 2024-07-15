import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { firstValueFrom, Observable } from "rxjs";
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private registerUrl = 'http://localhost:8080/api/auth/register/coach';
  private loginUrl = 'http://localhost:8080/api/auth/login';
  private refreshUrl = 'http://localhost:8080/api/auth/refresh';
  private logoutUrl = 'http://localhost:8080/api/auth/logout';

  constructor(private http: HttpClient, private readonly router: Router) {}

  async register(userData: any): Promise<any> {
    const response = await firstValueFrom(this.http.post<any>(this.registerUrl, userData));
    if (response.statusCode === 200) {
      return { success: true }
    } else {
      return { success: false }
    }
  }

  async login(email: string, password: string, rememberMeChecked: boolean): Promise<any> {
    const response = await firstValueFrom(this.http.post<any>(this.loginUrl, { email, password, rememberMeChecked }, { withCredentials: true }));
    if (response.statusCode === 200 && (response.role === "COACH" || response.role === "ADMIN")) {
      return { success: true, token: response.token, role: response.role, id: response.user_id };
    } else {
      return { success: false, error: response.error};
    }
  }

  refreshToken(): Observable<any> {
    const rememberMeChecked = localStorage.getItem('rememberMe') === 'true';
    return this.http.post<any>(this.refreshUrl, { rememberMeChecked }, { withCredentials: true });
  }

  logout(): void {
    const token: string = localStorage.getItem('token') || '';
    const headers = this.createHeaders(token);
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    this.router.navigate(['/']);

    this.http.post(this.logoutUrl, {}, { headers: headers, withCredentials: true }).subscribe(
      () => {
        console.log('Logged out successfully from backend');
      },
      (error) => {
        console.log('Failed to log out from backend', error);
      }
    )
  }

  private createHeaders(token: string) {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
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
