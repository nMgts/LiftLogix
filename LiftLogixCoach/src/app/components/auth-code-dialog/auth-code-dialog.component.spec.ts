import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthCodeDialogComponent } from './auth-code-dialog.component';

describe('AuthCodeDialogComponent', () => {
  let component: AuthCodeDialogComponent;
  let fixture: ComponentFixture<AuthCodeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuthCodeDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthCodeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
