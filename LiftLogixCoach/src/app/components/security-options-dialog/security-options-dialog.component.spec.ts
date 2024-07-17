import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityOptionsDialogComponent } from './security-options-dialog.component';

describe('SecurityOptionsDialogComponent', () => {
  let component: SecurityOptionsDialogComponent;
  let fixture: ComponentFixture<SecurityOptionsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SecurityOptionsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecurityOptionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
