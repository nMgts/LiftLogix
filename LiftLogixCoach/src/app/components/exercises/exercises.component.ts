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
  displayedExercises: (Exercise & { imageSafeUrl: SafeUrl })[] = [];
  pageSize = 0;
  pageIndex = 0;
  totalExercises = 0;

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

  loadExercises() {
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
        console.log(this.exercises);
        this.totalExercises = this.exercises.length;
        this.updatePageSize();
        this.updateDisplayedExercises();
      },
      (error) => {
        console.error('Error loading exercises', error);
      }
    );
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
      this.displayedExercises = this.exercises.slice(start, end);
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

  addExercise(event: Event): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(AddExerciseDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadExercises();
      }
    });
  }
}
