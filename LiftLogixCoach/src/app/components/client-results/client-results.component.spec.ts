import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientResultsComponent } from './client-results.component';

describe('ClientResultsComponent', () => {
  let component: ClientResultsComponent;
  let fixture: ComponentFixture<ClientResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClientResultsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
