import { TestBed } from '@angular/core/testing';

import { InfoGaurd } from './info.guard';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('InfoGuard', () => {
  let guard: InfoGaurd;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(InfoGaurd);
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
     const result = guard.decideNewUrl(currHost);
     expect(result).toBe(
        `http://localhost:7998/info/index.html`
     );

     const currHost1 = 'localhost:7998';
     const result1 = guard.decideNewUrl(currHost1);
     expect(result1).toBe(
       `http://localhost:7998/info/index.html`
     );
 
     const currHost2 = 'test.com';
     const result2 = guard.decideNewUrl(currHost2);
     expect(result2).toBe(
        `http://test.com/info/index.html`
     );
   });
});
