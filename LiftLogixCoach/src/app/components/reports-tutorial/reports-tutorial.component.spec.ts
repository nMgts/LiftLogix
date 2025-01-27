import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsTutorialComponent } from './reports-tutorial.component';

describe('ReportsTutorialComponent', () => {
  let component: ReportsTutorialComponent;
  let fixture: ComponentFixture<ReportsTutorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportsTutorialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportsTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
