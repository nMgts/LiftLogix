import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustPersonalPlanDialogComponent } from './adjust-personal-plan-dialog.component';

describe('AdjustPersonalPlanDialogComponent', () => {
  let component: AdjustPersonalPlanDialogComponent;
  let fixture: ComponentFixture<AdjustPersonalPlanDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdjustPersonalPlanDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdjustPersonalPlanDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
