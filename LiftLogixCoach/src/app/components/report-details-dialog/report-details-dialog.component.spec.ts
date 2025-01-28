import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDetailsDialogComponent } from './report-details-dialog.component';

describe('ReportDetailsDialogComponent', () => {
  let component: ReportDetailsDialogComponent;
  let fixture: ComponentFixture<ReportDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportDetailsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
