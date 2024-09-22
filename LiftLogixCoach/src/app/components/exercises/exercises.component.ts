import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, Renderer2, ViewChild } from '@angular/core';
import { Exercise } from "../../interfaces/Exercise";
import { ExerciseService } from "../../services/exercise.service";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { PageEvent } from "@angular/material/paginator";
import { MatDialog } from "@angular/material/dialog";
import { ExerciseDetailsDialogComponent } from "../exercise-details-dialog/exercise-details-dialog.component";
import { AddExerciseDialogComponent } from "../add-exercise-dialog/add-exercise-dialog.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { BasicExercise } from "../../interfaces/BasicExercise";

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.component.html',
  styleUrl: './exercises.component.scss'
})
export class ExercisesComponent implements OnChanges {
  @Input() isBoxExpanded = false;
  @Output() closeBox = new EventEmitter<void>();
  @ViewChild('elem', { static: true }) elem!: ElementRef;
  scrollTimeout: any;

  exercises: BasicExercise[] = [];
  filteredExercises: BasicExercise[] = [];
  displayedExercises: (BasicExercise & { imageSafeUrl: SafeUrl })[] = [];

  pageSize = 0;
  pageIndex = 0;
  totalExercises = 0;
  searchKeyword: string = '';

  isDropdownOpen = false;
  selectedBodyParts: string[] = [];
  body_parts = [
    'CHEST', 'BACK', 'BICEPS', 'TRICEPS', 'SHOULDERS',
    'FOREARMS', 'ABS', 'CALVES', 'QUAD', 'HAMSTRING', 'GLUTE'
  ];
  selectedExerciseTypes: string[] = [];
  exercise_types = [
    'SQUAT', 'BENCHPRESS', 'DEADLIFT'
  ];

  filterCertificated = false;

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
  exerciseTypesTranslations: { [key: string]: string } = {
    'SQUAT': 'PRZYSIAD',
    'BENCHPRESS': 'WYCISKANIE',
    'DEADLIFT': 'MARTWY CIĄG'
  }

  private readonly defaultImageUrl: string = '/icons/dumbbell.jpg';
  protected readonly window = window;

  constructor(
    private exerciseService: ExerciseService,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private renderer: Renderer2
    ) {}

  ngOnChanges(): void {
    if (this.isBoxExpanded) {
      this.loadExercises();
    }
  }

  async loadExercises() {
    const token = localStorage.getItem('token') || '';
    this.exerciseService.getExercises(token).subscribe(
      (data: BasicExercise[]) => {
        this.exercises = data;

        this.filterExercises();
        this.updatePageSize();
        this.updateDisplayedExercises();
      },
      (error) => {
        console.error('Error loading exercises', error);
      }
    );
  }

  filterExercises(): void {
    let filtered = this.exercises;

    if (this.selectedBodyParts.length > 0) {
      filtered = filtered.filter(exercise =>
        exercise.body_parts.some(part => this.selectedBodyParts.includes(part))
      );
    } else {
      filtered = [...this.exercises];
    }

    if (this.selectedExerciseTypes.length > 0) {
      filtered = filtered.filter(exercise =>
        this.selectedExerciseTypes.includes(exercise.exercise_type)
      );
    }

    if (this.searchKeyword.trim()) {
      const keyword = this.searchKeyword.trim().toLowerCase();
      const keywordWords = keyword.split(' ').filter(Boolean);

      const containsAllKeywords = (alias: string, keywords: string[]): boolean => {
        const aliasWords = alias.split(' ').filter(Boolean);
        return keywords.every(keyword =>
          aliasWords.some(aliasWord => aliasWord.includes(keyword))
        );
      };

      filtered = filtered.filter(exercise =>
        exercise.aliases.some(alias =>
          containsAllKeywords(alias.alias.toLowerCase(), keywordWords)
        )
      );
    }

    if (this.filterCertificated) {
      filtered = filtered.filter(exercise => exercise.certificated);
    }

    this.filteredExercises = filtered;
    this.pageIndex = 0;
    this.updateDisplayedExercises();
  }


  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  cancelAllActions() {
    this.isDropdownOpen = false;
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchKeyword = input.value;
    this.filterExercises();
  }

  onCheckboxChange(event: Event) {
    event.stopPropagation();
    const checkbox = event.target as HTMLInputElement;
    const value = checkbox.value;

    if (checkbox.checked) {
      if (!this.selectedBodyParts.includes(value)) {
        this.selectedBodyParts.push(value);
      }
    } else {
      this.selectedBodyParts = this.selectedBodyParts.filter(part => part !== value);
    }
    this.filterExercises();
  }

  onCertificatedCheckboxChange(event: Event) {
    event.stopPropagation();
    const checkbox = event.target as HTMLInputElement;
    this.filterCertificated = checkbox.checked;
    this.filterExercises();
  }

  onTypesCheckboxChange(event: Event) {
    event.stopPropagation();
    const checkbox = event.target as HTMLInputElement;
    const value = checkbox.value;

    if (checkbox.checked) {
      if (!this.selectedExerciseTypes.includes(value)) {
        this.selectedExerciseTypes.push(value);
      }
    } else {
      this.selectedExerciseTypes = this.selectedExerciseTypes.filter(part => part !== value);
    }
    this.filterExercises();
  }

  clearFilters(event: Event) {
    event.stopPropagation();
    this.selectedBodyParts = [];
    this.selectedExerciseTypes = [];
    this.filterCertificated = false;
    this.filterExercises();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.updatePageSize();
    this.updateDisplayedExercises();
  }

  updatePageSize() {
    const containerWidth = document.querySelector('.exercise-grid')?.clientWidth || 0;
    const cardWidth = 170;
    const columns = Math.floor((containerWidth + 20) / cardWidth);
    this.pageSize = columns * 3;
  }

  updateDisplayedExercises() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    const token = localStorage.getItem('token') || '';

    this.displayedExercises = this.filteredExercises.slice(start, end).map(exercise => {
      const cachedImage = this.exerciseService.imageCache[exercise.id];
      return {
        ...exercise,
        imageSafeUrl: cachedImage ?
          this.sanitizer.bypassSecurityTrustUrl(cachedImage) :
          this.sanitizer.bypassSecurityTrustUrl(this.defaultImageUrl)
      };
    });

    this.totalExercises = this.filteredExercises.length;

    const uncachedIds = this.displayedExercises
      .filter(exercise => !this.exerciseService.imageCache[exercise.id])
      .map(exercise => exercise.id);

    if (uncachedIds.length > 0) {
      this.exerciseService.getCachedBatchImages(uncachedIds, token).subscribe(
        (images: { [key: number]: string }) => {
          this.displayedExercises = this.displayedExercises.map(exercise => ({
            ...exercise,
            imageSafeUrl: images[exercise.id] ?
              this.sanitizer.bypassSecurityTrustUrl(images[exercise.id]) :
              exercise.imageSafeUrl  // Zachowaj już ustawiony obraz (cache lub domyślny)
          }));
        },
        (error) => {
          console.error('Error loading images', error);
        }
      );
    }
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateDisplayedExercises();
  }

  openDetails(exercise: BasicExercise) {
    const token = localStorage.getItem('token') || '';
    this.exerciseService.getExerciseDetails(exercise.id, token).subscribe({
      next: (exercise: Exercise) => {
        this.dialog.open(ExerciseDetailsDialogComponent, {
          data: exercise
        });
      },
      error: (err) => {
        console.error('Error fetching exercise details:', err);
      }
    });
  }

  addExercise() {
    const dialogRef = this.dialog.open(AddExerciseDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.openSnackBar('Pomyślnie dodano nowe ćwiczenie');
        this.loadExercises();
      }
    });
  }

  translateBodyParts(bodyParts: string[]): string[] {
    return bodyParts.map(part => this.bodyPartsTranslations[part] || part);
  }

  getTranslatedBodyParts(exercise: BasicExercise): string {
    return this.translateBodyParts(exercise.body_parts).join(', ');
  }

  onScroll(event: Event): void {
    const target = event.target as HTMLElement;

    if (target) {
      this.renderer.addClass(document.body, 'show-scrollbar');

      clearTimeout(this.scrollTimeout);

      this.scrollTimeout = setTimeout(() => {
        this.renderer.removeClass(document.body, 'show-scrollbar');
      }, 3000);
    }
  }

  close(event: Event) {
    event.stopPropagation();
    this.searchKeyword = '';
    this.clearFilters(event);
    this.closeBox.emit();
  }

  private openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }
}
