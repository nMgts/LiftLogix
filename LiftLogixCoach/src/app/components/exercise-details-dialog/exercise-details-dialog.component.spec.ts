import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseDetailsDialogComponent } from './exercise-details-dialog.component';

describe('ExerciseDetailsDialogComponent', () => {
  let component: ExerciseDetailsDialogComponent;
  let fixture: ComponentFixture<ExerciseDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExerciseDetailsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExerciseDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
