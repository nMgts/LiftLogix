import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {Note} from "../../interfaces/Note";
import {NoteService} from "../../services/note.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.scss'
})
export class NotesComponent implements OnInit {
  notes: Note[] = [];
  editingNoteId: number | null = null;
  editedText: string = '';

  @ViewChild('elem', { static: true }) elem!: ElementRef;
  @ViewChild('notesContainer', { static: true }) notesContainer!: ElementRef;
  @ViewChild('textarea') textarea: ElementRef | undefined;
  scrollTimeout: any;
  protected readonly window = window;

  constructor(
    private noteService: NoteService,
    private renderer: Renderer2,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadNotes();
  }

  loadNotes() {
    const token = localStorage.getItem('token') || '';
    this.noteService.getMyNotes(token).subscribe({
      next: (data) => (this.notes = data.sort((a, b) => b.id - a.id)),
      error: (err) => console.error('Error fetching notes:', err),
    });
  }

  startEditing(note: Note, event: Event) {
    event.stopPropagation();
    this.editingNoteId = note.id;
    this.editedText = note.text;

    setTimeout(() => {
      const inputElement = this.textarea?.nativeElement;
      if (inputElement) {
        inputElement.focus();
      }
    }, 5);
  }

  cancelEditing(note: Note, event: FocusEvent) {
    event.stopPropagation();
    const relatedTarget = event.relatedTarget as HTMLElement;

    if (relatedTarget && relatedTarget.tagName === 'BUTTON' && relatedTarget.textContent === 'Zapisz') {
      return;
    }
    this.editingNoteId = null;
    this.editedText = '';

    setTimeout(() => {
      if (note.id <= 0) {
        this.deleteNote(note.id);
      }
    }, 5);
  }

  saveNote(note: Note, event: Event) {
    event.stopPropagation();

    if (!this.editedText || this.editedText.trim() === '') {
      this.openSnackBar("Notatka nie może być pusta");
      return;
    }

    const token = localStorage.getItem('token') || '';
    note.text = this.editedText;
    this.noteService.updateNote(note, token).subscribe({
      next: (data) => {
        note = data;
        this.editingNoteId = null;
        this.editedText = '';
        this.loadNotes();
      },
      error: (err) => console.error('Error updating note:', err),
    });
  }

  deleteNote(noteId: number) {
    const token = localStorage.getItem('token') || '';
    this.noteService.deleteNote(noteId, token).subscribe({
      next: () => {
        this.notes = this.notes.filter(note => note.id !== noteId);
      },
      error: (err) => this.notes = this.notes.filter(note => note.id !== noteId),
    });
  }

  addNote(event: Event) {
    event.stopPropagation();
    const token = localStorage.getItem('token') || '';
    const newNote: Note = {
      id: this.generateTemporaryId(),
      text: '',
      coach_id: Number(localStorage.getItem('id')) || 0,
    };

    this.notes.unshift(newNote);
    setTimeout(() => {
      const notesContainer = this.notesContainer.nativeElement;
      if (notesContainer) {
        notesContainer.scrollTop = 0;
      }
    });

    this.startEditing(newNote, event);
  }

  private generateTemporaryId(): number {
    return Math.floor(Math.random() * -1000000);
  }

  onScroll(event: Event) {
    const target = event.target as HTMLElement;

    if (target) {
      this.renderer.addClass(document.body, 'show-scrollbar');

      clearTimeout(this.scrollTimeout);

      this.scrollTimeout = setTimeout(() => {
        this.renderer.removeClass(document.body, 'show-scrollbar');
      }, 3000);
    }
  }

  private openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }
}
