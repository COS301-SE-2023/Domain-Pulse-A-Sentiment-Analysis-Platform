import { TestBed } from '@angular/core/testing';

import { SurveyRedirectGuard } from './survey-redirect.guard';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('SurveyRedirectGuard', () => {
  let guard: SurveyRedirectGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(SurveyRedirectGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should return false', () => {
   // mock the window redirect funciton
    spyOn(guard, 'redirect');

    const result: boolean = guard.canActivate(
      new ActivatedRouteSnapshot(),
      <RouterStateSnapshot>{ url: 'testUrl' }
    ) as boolean;

    expect(result).toBe(false);
  });

  it('should return the correct url depending on the host', () => {
    const currHost = 'localhost:4200';
    const sourceId = '123';
    const sourceName = 'test';
    const result = guard.decideNewUrl(currHost, sourceId, sourceName);
    expect(result).toBe(
      `http://localhost:8004/ingest/post-review/${sourceId}/${sourceName}`
    );

    const currHost2 = 'test.com';
    const result2 = guard.decideNewUrl(currHost2, sourceId, sourceName);
    expect(result2).toBe(
      `http://test.com/ingest/post-review/${sourceId}/${sourceName}`
    );
  });
});
