import { TestBed } from '@angular/core/testing';

import { AuthGuardService } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AuthGuardService);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
