import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { catchError, Observable, switchMap, throwError } from "rxjs";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.authService.refreshToken().pipe(
            switchMap((refreshResponse) => {
              if (refreshResponse.statusCode === 200) {
                console.log("Wykonuję odświeżenie tokena");
                localStorage.setItem('token', refreshResponse.token);

                const authRequest = request.clone({
                  setHeaders: {
                    Authorization: `Bearer ${refreshResponse.token}`
                  }
                });
                return next.handle(authRequest);
              } else {
                this.authService.logout();
                return throwError('Refresh token failed');
              }
            })
          );
        }
        return throwError(error);
      })
    );
  }
}
