import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavePlanDialogComponent } from './save-plan-dialog.component';

describe('SavePlanDialogComponent', () => {
  let component: SavePlanDialogComponent;
  let fixture: ComponentFixture<SavePlanDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SavePlanDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavePlanDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
