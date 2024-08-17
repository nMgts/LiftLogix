import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutLibraryPrivateComponent } from './workout-library-private.component';

describe('WorkoutLibraryPrivateComponent', () => {
  let component: WorkoutLibraryPrivateComponent;
  let fixture: ComponentFixture<WorkoutLibraryPrivateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkoutLibraryPrivateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutLibraryPrivateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
