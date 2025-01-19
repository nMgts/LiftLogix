import {Component, OnInit} from '@angular/core';
import {Note} from "../../interfaces/Note";
import {NoteService} from "../../services/note.service";

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.scss'
})
export class NotesComponent implements OnInit {
  notes: Note[] = [];
  editingNoteId: number | null = null;
  editedText: string = '';

  constructor(private noteService: NoteService) {}

  ngOnInit(): void {
    this.loadNotes();
  }

  loadNotes(): void {
    const token = localStorage.getItem('token') || '';
    this.noteService.getMyNotes(token).subscribe({
      next: (data) => (this.notes = data.sort((a, b) => a.position - b.position)),
      error: (err) => console.error('Error fetching notes:', err),
    });
  }

  startEditing(note: Note): void {
    this.editingNoteId = note.id;
    this.editedText = note.text;
  }

  cancelEditing(): void {
    this.editingNoteId = null;
    this.editedText = '';
  }

  saveNote(note: Note): void {
    const token = localStorage.getItem('token') || '';
    note.text = this.editedText;
    this.noteService.updateNote(note, token).subscribe({
      next: () => {
        this.editingNoteId = null;
        this.editedText = '';
      },
      error: (err) => console.error('Error updating note:', err),
    });
  }

  deleteNote(noteId: number): void {
    const token = localStorage.getItem('token') || '';
    this.noteService.deleteNote(noteId, token).subscribe({
      next: () => {
        this.notes = this.notes.filter(note => note.id !== noteId);
      },
      error: (err) => console.error('Error deleting note:', err),
    });
  }
}
