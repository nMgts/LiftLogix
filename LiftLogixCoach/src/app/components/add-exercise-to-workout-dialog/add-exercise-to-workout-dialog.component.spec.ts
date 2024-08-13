import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddExerciseToWorkoutDialogComponent } from './add-exercise-to-workout-dialog.component';

describe('AddExerciseToWorkoutDialogComponent', () => {
  let component: AddExerciseToWorkoutDialogComponent;
  let fixture: ComponentFixture<AddExerciseToWorkoutDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddExerciseToWorkoutDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddExerciseToWorkoutDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
