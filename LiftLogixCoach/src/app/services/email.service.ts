import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { firstValueFrom, Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private resendUrl = 'http://localhost:8080/api/email/resend-confirmation';
  private confirmEmailUrl = 'http://localhost:8080/api/email/confirm';
  private sendCodeUrl = 'http://localhost:8080/api/email/send-verification-code';
  private updateEmailUrl = 'http://localhost:8080/api/email/update-email';

  constructor(private http: HttpClient) {}

  async resendConfirmationEmail(email: string): Promise<any> {
    return await firstValueFrom(this.http.post<any>(this.resendUrl, { email }));
  }

  confirmEmail(token: string): Observable<string> {
    let params = new HttpParams().set('token', token);
    return this.http.put(this.confirmEmailUrl, {}, { params: params, responseType: 'text' });
  }

  sendVerificationCode(email: string, token: string): Observable<void> {
    const headers = this.createHeaders(token);
    return this.http.post<void>(this.sendCodeUrl, { email }, { headers: headers })
  }

  updateEmail(currentEmail: string, newEmail: string, verificationCode: string, token: string): Observable<void> {
    const headers = this.createHeaders(token);
    return this.http.put<void>(this.updateEmailUrl, { currentEmail, newEmail, verificationCode }, { headers: headers });
  }

  private createHeaders(token: string) {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
