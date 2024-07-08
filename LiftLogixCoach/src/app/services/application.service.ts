import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Application} from "../interfaces/Application";
import {firstValueFrom} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private getUrl = 'http://localhost:8080/api/application/mine';

  constructor(private http: HttpClient) {}

  async getMyApplications(): Promise<Application[]> {
    try {
      const url = `${this.getUrl}`;
      const token: any = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
      return await firstValueFrom(this.http.get<any>(url, {headers}));
    } catch (error) {
      console.error('Error loading applications', error);
      throw error;
    }
  }
}
