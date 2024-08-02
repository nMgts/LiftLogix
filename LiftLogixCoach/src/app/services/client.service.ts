import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { Client } from "../interfaces/Client";

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private getUrl = 'http://localhost:8080/api/client/my';
  private getNumberUrl = 'http://localhost:8080/api/client/quantity';

  constructor(private http: HttpClient) {}

  getMyClients(token: string): Observable<Client[]> {
    const headers = this.createHeaders(token);
    return this.http.get<Client[]>(this.getUrl, { headers: headers });
  }

  getMyClientsQuantity(token: string): Observable<any> {
    const headers = this.createHeaders(token);
    return this.http.get<number>(this.getNumberUrl, { headers: headers });
  }

  private createHeaders(token: string) {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
