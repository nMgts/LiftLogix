import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWorkoutDialogComponent } from './add-workout-dialog.component';

describe('AddWorkoutDialogComponent', () => {
  let component: AddWorkoutDialogComponent;
  let fixture: ComponentFixture<AddWorkoutDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddWorkoutDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddWorkoutDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
