import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftWorkoutsDialogComponent } from './shift-workouts-dialog.component';

describe('ShiftWorkoutsDialogComponent', () => {
  let component: ShiftWorkoutsDialogComponent;
  let fixture: ComponentFixture<ShiftWorkoutsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShiftWorkoutsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShiftWorkoutsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
