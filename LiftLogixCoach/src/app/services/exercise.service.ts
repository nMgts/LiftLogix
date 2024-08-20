import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { map, Observable, of } from "rxjs";
import { Exercise } from "../interfaces/Exercise";
import { BasicExercise } from "../interfaces/BasicExercise";

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private baseUrl = 'http://localhost:8080/api/exercise';
  private getUrl = 'http://localhost:8080/api/exercise/all';
  private searchByAliasUrl = 'http://localhost:8080/api/exercise/searchByAlias';
  private addUrl = 'http://localhost:8080/api/exercise/add';
  private getImagesUrl = 'http://localhost:8080/api/exercise/images/batch';
  private _imageCache: { [key: number]: string } = {};

  constructor(private http: HttpClient) {}

  public get imageCache(): { [key: number]: string } {
    return this._imageCache;
  }

  getExercises(token: string): Observable<BasicExercise[]> {
    const headers = this.createHeaders(token);
    return this.http.get<BasicExercise[]>(this.getUrl, { headers: headers });
  }

  getExerciseDetails(exerciseId: number, token: string): Observable<Exercise> {
    const headers = this.createHeaders(token);
    return this.http.get<Exercise>(`${this.baseUrl}/${exerciseId}`, { headers: headers });
  }

  addExercise(token: string, data: FormData): Observable<any> {
    const headers = this.createHeaders(token);
    return this.http.post<void>(this.addUrl, data, { headers: headers });
  }

  getFilteredExercisesByAlias(token: string, alias: string): Observable<Exercise[]> {
    const headers = this.createHeaders(token);
    const params = new HttpParams().set('alias', alias);
    return this.http.get<Exercise[]>(this.searchByAliasUrl, { headers, params });
  }

  getBatchImages(ids: number[], token: string): Observable<{ [key: number]: string }> {
    const headers = this.createHeaders(token);
    return this.http.post<{ [key: number]: string }>(this.getImagesUrl, ids, { headers: headers });
  }

  getCachedBatchImages(ids: number[], token: string): Observable<{ [key: number]: string }> {
    const cachedImages: { [key: number]: string } = {};
    const uncachedIds: number[] = [];

    ids.forEach(id => {
      if (this._imageCache[id]) {
        cachedImages[id] = this._imageCache[id];
      } else {
        uncachedIds.push(id);
      }
    });

    if (uncachedIds.length === 0) {
      return of(cachedImages);
    }

    return this.getBatchImages(uncachedIds, token).pipe(
      map(images => {
        Object.keys(images).forEach(key => {
          const id = +key;
          this._imageCache[id] = images[id];
        });
        return { ...cachedImages, ...images };
      })
    );
  }

  private createHeaders(token: string) {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
