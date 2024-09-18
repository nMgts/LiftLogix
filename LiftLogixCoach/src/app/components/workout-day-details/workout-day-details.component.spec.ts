import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutDayDetailsComponent } from './workout-day-details.component';

describe('WorkoutDayDetailsComponent', () => {
  let component: WorkoutDayDetailsComponent;
  let fixture: ComponentFixture<WorkoutDayDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkoutDayDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutDayDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
