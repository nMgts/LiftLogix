import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleTutorialComponent } from './schedule-tutorial.component';

describe('ScheduleTutorialComponent', () => {
  let component: ScheduleTutorialComponent;
  let fixture: ComponentFixture<ScheduleTutorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScheduleTutorialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
