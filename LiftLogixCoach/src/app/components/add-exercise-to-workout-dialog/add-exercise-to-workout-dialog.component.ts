import { Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Exercise } from "../../interfaces/Exercise";
import { FormControl } from "@angular/forms";
import { catchError, Observable, of, startWith, switchMap } from "rxjs";
import { ExerciseService } from "../../services/exercise.service";
import { ExerciseDetailsDialogComponent } from "../exercise-details-dialog/exercise-details-dialog.component";
import {AddExerciseDialogComponent} from "../add-exercise-dialog/add-exercise-dialog.component";

@Component({
  selector: 'app-add-exercise-to-workout-dialog',
  templateUrl: './add-exercise-to-workout-dialog.component.html',
  styleUrl: './add-exercise-to-workout-dialog.component.scss'
})
export class AddExerciseToWorkoutDialogComponent implements OnInit {
  exerciseName: string = '';
  searchControl = new FormControl();
  filteredExercises$: Observable<Exercise[]> = of([]);
  isDropdownOpen = false;
  exercise: Exercise | null = null;

  scrollTimeout: any;
  @ViewChild('elem', { static: true }) elem!: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<AddExerciseToWorkoutDialogComponent>,
    private snackBar: MatSnackBar,
    private exerciseService: ExerciseService,
    private dialog: MatDialog,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token') || '';
    this.filteredExercises$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      switchMap(value => this.exerciseService.getFilteredExercisesByAlias(token, value).pipe(
        catchError(() => of([]))
      ))
    );
  }

  showDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = true;
    this.exercise = null;
  }

  hideDropdown() {
    this.isDropdownOpen = false;
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  onExerciseSelect(exercise: Exercise): void {
    this.exerciseName = exercise.name;
    this.exercise = exercise;
    this.searchControl.setValue(exercise.name);
    this.isDropdownOpen = false;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.exercise) {
      this.dialogRef.close(this.exercise);
    } else {
      this.openSnackBar('Musisz wybrać ćwiczenie');
    }
  }

  openExerciseDetails(exercise: Exercise, event: Event): void {
    event.stopPropagation();
    this.dialog.open(ExerciseDetailsDialogComponent, {
      data: exercise
    });
  }

  openAddExerciseDialog(): void {
    const dialogRef = this.dialog.open(AddExerciseDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.exercise = result;
        this.onConfirm();
      }
    });
  }

  onScroll(event: Event): void {
    const target = event.target as HTMLElement;

    if (target && target.classList.contains('dropdown')) {
      this.renderer.addClass(document.body, 'show-scrollbar');

      clearTimeout(this.scrollTimeout);

      this.scrollTimeout = setTimeout(() => {
        this.renderer.removeClass(document.body, 'show-scrollbar');
      }, 3000);
    }
  }

  private openSnackBar(message: string): void {
    this.snackBar.open(message, 'Zamknij', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }
}
