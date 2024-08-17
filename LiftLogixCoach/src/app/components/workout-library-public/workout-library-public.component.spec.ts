import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutLibraryPublicComponent } from './workout-library-public.component';

describe('WorkoutLibraryPublicComponent', () => {
  let component: WorkoutLibraryPublicComponent;
  let fixture: ComponentFixture<WorkoutLibraryPublicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkoutLibraryPublicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutLibraryPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
