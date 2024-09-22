import { AfterViewInit, Component, ElementRef, HostListener, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { MatDialogRef } from "@angular/material/dialog";
import { ExerciseService } from "../../services/exercise.service";
import { YoutubeEmbedPipe } from '../../pipes/youtube-embed.pipe';
import { Exercise } from "../../interfaces/Exercise";

@Component({
  selector: 'app-add-exercise-dialog',
  templateUrl: './add-exercise-dialog.component.html',
  styleUrl: './add-exercise-dialog.component.scss'
})
export class AddExerciseDialogComponent implements AfterViewInit {
  exerciseForm: FormGroup;
  draggingOver = false;
  newImage: SafeUrl | null = null;
  selectedImage: File | null = null;
  errorMessage: string | null = null;
  aliases: string[] = [];

  body_parts = [
    'CHEST', 'BACK', 'BICEPS', 'TRICEPS', 'SHOULDERS',
    'FOREARMS', 'ABS', 'CALVES', 'QUAD', 'HAMSTRING', 'GLUTE'
  ];
  exercise_types = [
    'SQUAT', 'BENCHPRESS', 'DEADLIFT', 'OTHER'
  ];

  bodyPartsTranslations: { [key: string]: string } = {
    'CHEST': 'KLATKA',
    'BACK': 'PLECY',
    'BICEPS': 'BICEPS',
    'TRICEPS': 'TRICEPS',
    'SHOULDERS': 'BARKI',
    'FOREARMS': 'PRZEDRAMIONA',
    'ABS': 'BRZUCH',
    'CALVES': 'ŁYDKI',
    'QUAD': 'CZWOROGŁOWE',
    'HAMSTRING': 'DWUGŁOWE',
    'GLUTE': 'POŚLADKI'
  };
  exerciseTypesTranslation: { [key: string]: string } = {
    'SQUAT': 'PRZYSIAD',
    'BENCHPRESS': 'WYCISKANIE',
    'DEADLIFT': 'MARTWY CIĄG',
    'OTHER': 'INNE'
  }

  scrollTimeout: any;
  @ViewChild('dialog', { static: true }) dialog!: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<AddExerciseDialogComponent>,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private exerciseService: ExerciseService,
    private youtubeEmbedPipe: YoutubeEmbedPipe,
    private renderer: Renderer2
  ) {
    this.exerciseForm = this.fb.group({
      name: ['', Validators.required],
      exercise_type: ['OTHER'],
      difficulty_factor: [1],
      body_parts: [[]],
      description: [''],
      url: [''],
      image: [''],
      newAlias: ['']
    });
  }

  ngAfterViewInit(): void {
    this.renderer.listen(this.dialog.nativeElement, 'scroll', () => {
      this.onWindowScroll();
    });
  }

  onExerciseTypeChange(event: any): void {
    const selectedType = event.value;
    const difficultyControl = this.exerciseForm.get('difficulty_factor');

    if (selectedType !== 'OTHER') {
      difficultyControl?.setValidators([Validators.required, Validators.min(0.1)]);
    } else {
      difficultyControl?.clearValidators();
      difficultyControl?.setValue(1);
    }

    difficultyControl?.updateValueAndValidity();
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
      const name = this.exerciseForm.get('name')?.value
      formData.append('name', name);
      formData.append('body_parts', this.exerciseForm.get('body_parts')?.value);
      formData.append('description', this.exerciseForm.get('description')?.value);
      formData.append('exercise_type', this.exerciseForm.get('exercise_type')?.value);
      formData.append('difficulty_factor', this.exerciseForm.get('difficulty_factor')?.value);

      const url = this.exerciseForm.get('url')?.value;
      const embeddedUrl = this.youtubeEmbedPipe.transform(url);
      console.log(embeddedUrl);
      formData.append('url', embeddedUrl);

      if (this.selectedImage) {
        formData.append('image', this.selectedImage);
      }

      if (!this.aliases.includes(name)) {
        this.aliases.push(name);
      }

      const aliasesString = this.aliases.join(',');
      formData.append('aliases', aliasesString);

      const token = localStorage.getItem('token') || '';
      this.exerciseService.addExercise(token, formData).subscribe(
        (newExercise: Exercise) => {
          this.dialogRef.close(newExercise);
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

  addAlias(): void {
    const newAliasValue = this.exerciseForm.get('newAlias')?.value;
    console.log(newAliasValue);
    if (newAliasValue && !this.aliases.includes(newAliasValue)) {
      this.aliases.push(newAliasValue);
      this.exerciseForm.get('newAlias')?.setValue('');
    }
  }

  removeAlias(index: number): void {
    this.aliases.splice(index, 1);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {

    this.renderer.addClass(document.body, 'show-scrollbar');

    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.renderer.removeClass(document.body, 'show-scrollbar');
    }, 3000);
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
