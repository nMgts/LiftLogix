import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { MatDialogRef } from "@angular/material/dialog";
import { ExerciseService } from "../../services/exercise.service";
import { YoutubeEmbedPipe } from '../../pipes/youtube-embed.pipe';

@Component({
  selector: 'app-add-exercise-dialog',
  templateUrl: './add-exercise-dialog.component.html',
  styleUrl: './add-exercise-dialog.component.scss'
})
export class AddExerciseDialogComponent {
  exerciseForm: FormGroup;
  draggingOver = false;
  newImage: SafeUrl | null = null;
  selectedImage: File | null = null;
  errorMessage: string | null = null;

  body_parts = [
    'CHEST', 'BACK', 'BICEPS', 'TRICEPS', 'SHOULDERS',
    'FOREARMS', 'ABS', 'CALVES', 'QUAD', 'HAMSTRING', 'GLUTE'
  ];

  constructor(
    public dialogRef: MatDialogRef<AddExerciseDialogComponent>,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private exerciseService: ExerciseService,
    private youtubeEmbedPipe: YoutubeEmbedPipe
  ) {
    this.exerciseForm = this.fb.group({
      name: ['', Validators.required],
      body_parts: [[]],
      description: [''],
      url: [''],
      image: ['']
    });
  }

  onFileSelected(event: any): void {
    this.selectedImage = event.target.files[0];
    if (this.selectedImage) {
      const objectURL = URL.createObjectURL(this.selectedImage);
      this.newImage = this.sanitizer.bypassSecurityTrustUrl(objectURL);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.draggingOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.draggingOver = false;
  }

  async onDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    this.draggingOver = false;
    const droppedFile = event.dataTransfer?.files[0];
    if (droppedFile) {
      this.selectedImage = droppedFile;
      const objectUrl = URL.createObjectURL(this.selectedImage);
      this.newImage = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
    }
  }

  deleteNewImage(): void {
    this.selectedImage = null;
    this.newImage = null;
  }

  save(): void {
    if (this.exerciseForm.valid) {
      const formData = new FormData();
      formData.append('name', this.exerciseForm.get('name')?.value);
      formData.append('body_parts', this.exerciseForm.get('body_parts')?.value);
      formData.append('description', this.exerciseForm.get('description')?.value);

      const url = this.exerciseForm.get('url')?.value;
      const embeddedUrl = this.youtubeEmbedPipe.transform(url);
      console.log(embeddedUrl);
      formData.append('url', embeddedUrl);

      if (this.selectedImage) {
        formData.append('image', this.selectedImage);
      }

      const token = localStorage.getItem('token') || '';
      this.exerciseService.addExercise(token, formData).subscribe(
        () => {
          this.dialogRef.close(true);
        },
        (error) => {
          if (error.status === 409) {
            this.showError('Ćwiczenie o podanej nazwie już istnieje');
          } else {
            console.error('Error adding exercise', error);
          }
        }
      );
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 3000);
  }
}
