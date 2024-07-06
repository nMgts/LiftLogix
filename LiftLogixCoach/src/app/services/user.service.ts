import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private registerUrl = 'http://localhost:8080/api/auth/register/coach';
  private loginUrl = 'http://localhost:8080/api/auth/login';

  constructor(private http: HttpClient, private readonly router: Router) {}

  async register(userData: any): Promise<any> {
    const url = this.registerUrl;
    try {
      return await firstValueFrom(this.http.post<any>(url, userData));
    } catch (error) {
      throw error;
    }
  }

  async login(email: string, password: string): Promise<any> {
    const url = this.loginUrl;

    try {
      const response = await this.http.post<any>(this.loginUrl, { email, password }).toPromise();
      if (response.statusCode === 200 && (response.role === "COACH" || response.role === "ADMIN")) {
        return { success: true, token: response.token, role: response.role };
      } else {
        return { success: false, message: "Nie udało się zalogować"};
      }
    } catch (error) {
      throw error;
    }
  }

  logOut(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    }
    this.router.navigate(['/']);
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
