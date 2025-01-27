import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExercisesTutorialComponent } from './exercises-tutorial.component';

describe('ExercisesTutorialComponent', () => {
  let component: ExercisesTutorialComponent;
  let fixture: ComponentFixture<ExercisesTutorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExercisesTutorialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExercisesTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
