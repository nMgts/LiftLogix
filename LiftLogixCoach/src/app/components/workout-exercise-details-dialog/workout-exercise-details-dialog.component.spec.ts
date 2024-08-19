import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutExerciseDetailsDialogComponent } from './workout-exercise-details-dialog.component';

describe('WorkoutExerciseDetailsDialogComponent', () => {
  let component: WorkoutExerciseDetailsDialogComponent;
  let fixture: ComponentFixture<WorkoutExerciseDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkoutExerciseDetailsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutExerciseDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
