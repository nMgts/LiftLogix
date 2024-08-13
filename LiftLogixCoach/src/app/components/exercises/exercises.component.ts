import { Component, EventEmitter, HostListener, Input, OnChanges, Output } from '@angular/core';
import { Exercise } from "../../interfaces/Exercise";
import { ExerciseService } from "../../services/exercise.service";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { PageEvent } from "@angular/material/paginator";
import { MatDialog } from "@angular/material/dialog";
import { ExerciseDetailsDialogComponent } from "../exercise-details-dialog/exercise-details-dialog.component";
import { AddExerciseDialogComponent } from "../add-exercise-dialog/add-exercise-dialog.component";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.component.html',
  styleUrl: './exercises.component.scss'
})
export class ExercisesComponent implements OnChanges {
  @Input() isBoxExpanded = false;
  @Output() closeBox = new EventEmitter<void>();
  exercises: (Exercise & { imageSafeUrl: SafeUrl })[] = [];
  filteredExercises: (Exercise & { imageSafeUrl: SafeUrl })[] = [];
  displayedExercises: (Exercise & { imageSafeUrl: SafeUrl })[] = [];
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

  private readonly defaultImageUrl: string = '/icons/dumbbell.jpg';
  protected readonly window = window;

  constructor(
    private exerciseService: ExerciseService,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
    ) {}

  ngOnChanges(): void {
    if (this.isBoxExpanded) {
      this.loadExercises();
    }
  }

  async loadExercises() {
    const token = localStorage.getItem('token') || '';
    this.exerciseService.getExercises(token).subscribe(
      (data: Exercise[]) => {
        this.exercises = data.map(exercise => ({
          ...exercise,
          imageSafeUrl: this.sanitizer.bypassSecurityTrustUrl(
            exercise.image ? exercise.image : this.defaultImageUrl
          ),
          body_parts : exercise.body_parts || []
        }));

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

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchKeyword = input.value;
    this.filterExercises();
  }

  onCheckboxChange(event: Event): void {
    event.stopPropagation();
    const checkbox = event.target as HTMLInputElement;
    const value = checkbox.value;
    console.log(value);
    if (checkbox.checked) {
      if (!this.selectedBodyParts.includes(value)) {
        this.selectedBodyParts.push(value);
      }
    } else {
      this.selectedBodyParts = this.selectedBodyParts.filter(part => part !== value);
    }
    this.filterExercises();
  }

  clearFilters(event: Event): void {
    event.stopPropagation();
    this.selectedBodyParts = [];
    this.filterExercises();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.updatePageSize();
    this.updateDisplayedExercises();
  }

  updatePageSize(): void {
    const containerWidth = document.querySelector('.exercise-grid')?.clientWidth || 0;
    const cardWidth = 170;
    const columns = Math.floor((containerWidth + 20) / cardWidth);
    this.pageSize = columns * 3;
  }

  updateDisplayedExercises(): void {
      const start = this.pageIndex * this.pageSize;
      const end = start + this.pageSize;
      this.displayedExercises = this.filteredExercises.slice(start, end);
      this.totalExercises = this.filteredExercises.length;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateDisplayedExercises();
  }

  openDetails(exercise: Exercise): void {
    this.dialog.open(ExerciseDetailsDialogComponent, {
      data: exercise
    });
  }

  addExercise(): void {
    const dialogRef = this.dialog.open(AddExerciseDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.openSnackBar('Pomyślnie dodano nowe ćwiczenie');
        this.loadExercises();
      }
    });
  }

  close(event: Event) {
    event.stopPropagation();
    this.closeBox.emit();
  }

  private openSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }
}
