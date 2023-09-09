import { TestBed } from '@angular/core/testing';

import { SurveyRedirectGuard } from './survey-redirect.guard';

describe('SurveyRedirectGuard', () => {
  let guard: SurveyRedirectGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(SurveyRedirectGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
