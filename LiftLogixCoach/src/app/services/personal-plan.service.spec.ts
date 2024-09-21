import { TestBed } from '@angular/core/testing';

import { PersonalPlanService } from './personal-plan.service';

describe('PersonalPlanService', () => {
  let service: PersonalPlanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonalPlanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
