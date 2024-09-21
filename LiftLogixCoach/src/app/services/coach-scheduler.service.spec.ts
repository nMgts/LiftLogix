import { TestBed } from '@angular/core/testing';

import { CoachSchedulerService } from './coach-scheduler.service';

describe('CoachSchedulerService', () => {
  let service: CoachSchedulerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoachSchedulerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
