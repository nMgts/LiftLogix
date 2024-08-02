import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientHoursComponent } from './client-hours.component';

describe('ClientHoursComponent', () => {
  let component: ClientHoursComponent;
  let fixture: ComponentFixture<ClientHoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClientHoursComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
