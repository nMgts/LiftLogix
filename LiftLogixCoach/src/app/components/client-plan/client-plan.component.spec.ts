import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPlanComponent } from './client-plan.component';

describe('ClientPlanComponent', () => {
  let component: ClientPlanComponent;
  let fixture: ComponentFixture<ClientPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClientPlanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
