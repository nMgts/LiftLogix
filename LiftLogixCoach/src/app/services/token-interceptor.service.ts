import { Injectable } from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {UserService} from "./user.service";
import {catchError, Observable, switchMap, throwError} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor {

  constructor(private userService: UserService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.userService.refreshToken().pipe(
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
                this.userService.logOut();
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
