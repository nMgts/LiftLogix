import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditExerciseNameDialogComponent } from './edit-exercise-name-dialog.component';

describe('EditExerciseNameDialogComponent', () => {
  let component: EditExerciseNameDialogComponent;
  let fixture: ComponentFixture<EditExerciseNameDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditExerciseNameDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditExerciseNameDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
