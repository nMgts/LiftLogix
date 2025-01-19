import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { Note } from "../interfaces/Note";

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private getUrl = 'http://localhost:8080/api/note/my';
  private updateUrl = 'http://localhost:8080/api/note/update';
  private deleteUrl = 'http://localhost:8080/api/note/delete'

  constructor(private http: HttpClient) {}

  getMyNotes(token: string): Observable<Note[]> {
    const headers = this.createHeaders(token);
    return this.http.get<Note[]>(this.getUrl, { headers: headers });
  }

  updateNote(note: Note, token: string): Observable<Note> {
    const headers = this.createHeaders(token);
    return this.http.put<Note>(this.updateUrl, note, { headers: headers });
  }

  deleteNote(noteId: number, token: string): Observable<void> {
    const headers = this.createHeaders(token);
    return this.http.delete<void>(`${this.deleteUrl}/${noteId}`, { headers: headers });
  }

  private createHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }
}
