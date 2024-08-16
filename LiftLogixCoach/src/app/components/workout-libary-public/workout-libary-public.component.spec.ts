import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutLibaryPublicComponent } from './workout-libary-public.component';

describe('WorkoutLibaryPublicComponent', () => {
  let component: WorkoutLibaryPublicComponent;
  let fixture: ComponentFixture<WorkoutLibaryPublicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkoutLibaryPublicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutLibaryPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
