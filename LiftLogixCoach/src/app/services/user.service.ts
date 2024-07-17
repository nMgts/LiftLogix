import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Router } from "@angular/router";
import { firstValueFrom, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private forgotPasswordUrl = 'http://localhost:8080/api/user/forgot-password';
  private resetPasswordUrl = 'http://localhost:8080/api/user/reset-password';
  private verifyUrl = 'http://localhost:8080/api/user/verify';
  private checkPasswordUrl = 'http://localhost:8080/api/user/check';
  private updatePasswordUrl = 'http://localhost:8080/api/user/change-password';
  private getImageUrl = 'http://localhost:8080/api/user/image';

  constructor(private http: HttpClient, private readonly router: Router) {}

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

  verifyCode(email: string, code: string, token: string): Observable<void> {
    const headers = this.createHeaders(token);
    return this.http.post<void>(this.verifyUrl, { email, code }, { headers: headers })
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

  getUserImage(userId: string): Observable<Blob> {
    return this.http.get(`${this.getImageUrl}/${userId}`, { responseType: 'blob' });
  }

  private createHeaders(token: string) {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
