import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutDateChangeDialogComponent } from './workout-date-change-dialog.component';

describe('WorkoutDateChangeDialogComponent', () => {
  let component: WorkoutDateChangeDialogComponent;
  let fixture: ComponentFixture<WorkoutDateChangeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkoutDateChangeDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutDateChangeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
