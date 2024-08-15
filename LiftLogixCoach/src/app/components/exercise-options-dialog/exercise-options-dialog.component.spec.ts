import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseOptionsDialogComponent } from './exercise-options-dialog.component';

describe('ExerciseOptionsDialogComponent', () => {
  let component: ExerciseOptionsDialogComponent;
  let fixture: ComponentFixture<ExerciseOptionsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExerciseOptionsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExerciseOptionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
