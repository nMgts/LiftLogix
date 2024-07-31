import {Component, HostListener, Input, OnChanges, SimpleChanges} from '@angular/core';
import { Exercise } from "../../interfaces/Exercise";
import { ExerciseService } from "../../services/exercise.service";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { PageEvent } from "@angular/material/paginator";

interface onInit {
}

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.component.html',
  styleUrl: './exercises.component.scss'
})
export class ExercisesComponent implements onInit, OnChanges {
  @Input() isBoxExpanded = false;
  exercises: (Exercise & { imageSafeUrl: SafeUrl })[] = [];
  displayedExercises: (Exercise & { imageSafeUrl: SafeUrl })[] = [];
  pageSize = 0;
  pageIndex = 0;
  totalExercises = 0;

  constructor(private exerciseService: ExerciseService, private sanitizer: DomSanitizer) {}

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
          imageSafeUrl: this.sanitizer.bypassSecurityTrustUrl(exercise.image),
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
    console.log(containerWidth);
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
}
