import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutMenuComponent } from './workout-menu.component';

describe('WorkoutMenuComponent', () => {
  let component: WorkoutMenuComponent;
  let fixture: ComponentFixture<WorkoutMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkoutMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
