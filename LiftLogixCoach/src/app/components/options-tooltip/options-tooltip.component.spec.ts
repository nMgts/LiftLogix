import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionsTooltipComponent } from './options-tooltip.component';

describe('OptionsTooltipComponent', () => {
  let component: OptionsTooltipComponent;
  let fixture: ComponentFixture<OptionsTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OptionsTooltipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OptionsTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
