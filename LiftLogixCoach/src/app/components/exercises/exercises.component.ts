import { Component, HostListener, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Exercise } from "../../interfaces/Exercise";
import { ExerciseService } from "../../services/exercise.service";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { PageEvent } from "@angular/material/paginator";
import { MatDialog } from "@angular/material/dialog";
import { ExerciseDetailsDialogComponent } from "../exercise-details-dialog/exercise-details-dialog.component";
import { AddExerciseDialogComponent } from "../add-exercise-dialog/add-exercise-dialog.component";

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.component.html',
  styleUrl: './exercises.component.scss'
})
export class ExercisesComponent implements OnInit, OnChanges {
  @Input() isBoxExpanded = false;
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

  constructor(
    private exerciseService: ExerciseService,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog ) {}

  ngOnInit(): void {
    this.loadExercises();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isBoxExpanded']) {
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

    // Filter by body parts
    if (this.selectedBodyParts.length > 0) {
      filtered = filtered.filter(exercise=>
        exercise.body_parts.some(part => this.selectedBodyParts.includes(part))
      );
    } else {
      filtered = [...this.exercises];
    }

    if (this.searchKeyword.trim()) {
      const keyword = this.searchKeyword.trim().toLowerCase();
      filtered = filtered.filter(exercise =>
        exercise.aliases.some(alias =>
          alias.alias.toLowerCase().includes(keyword)
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
  onResize(event: Event): void {
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

  openDetails(exercise: Exercise, event: Event): void {
    event.stopPropagation();
    this.dialog.open(ExerciseDetailsDialogComponent, {
      data: exercise
    });
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  addExercise(event: Event): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(AddExerciseDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadExercises();
      }
    });
  }

    protected readonly window = window;
}
