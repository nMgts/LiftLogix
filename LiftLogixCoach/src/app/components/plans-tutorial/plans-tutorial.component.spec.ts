import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlansTutorialComponent } from './plans-tutorial.component';

describe('PlansTutorialComponent', () => {
  let component: PlansTutorialComponent;
  let fixture: ComponentFixture<PlansTutorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlansTutorialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlansTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
