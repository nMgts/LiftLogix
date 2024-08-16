import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutLibaryPrivateComponent } from './workout-libary-private.component';

describe('WorkoutLibaryPrivateComponent', () => {
  let component: WorkoutLibaryPrivateComponent;
  let fixture: ComponentFixture<WorkoutLibaryPrivateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkoutLibaryPrivateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutLibaryPrivateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
