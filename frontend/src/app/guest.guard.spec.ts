import { TestBed } from '@angular/core/testing';

import { GuestGuard } from './guest.guard';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('GuestGuard', () => {
  let guard: GuestGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(GuestGuard);
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
});
