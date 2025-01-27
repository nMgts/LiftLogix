import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsTutorialComponent } from './clients-tutorial.component';

describe('ClientsTutorialComponent', () => {
  let component: ClientsTutorialComponent;
  let fixture: ComponentFixture<ClientsTutorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClientsTutorialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientsTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
