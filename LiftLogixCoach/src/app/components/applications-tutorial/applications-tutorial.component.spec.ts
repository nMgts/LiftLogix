import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationsTutorialComponent } from './applications-tutorial.component';

describe('ApplicationsTutorialComponent', () => {
  let component: ApplicationsTutorialComponent;
  let fixture: ComponentFixture<ApplicationsTutorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApplicationsTutorialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationsTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
