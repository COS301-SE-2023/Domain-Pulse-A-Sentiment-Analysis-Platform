import { TestBed } from '@angular/core/testing';

import { AuthGuardService } from './auth.guard';
import { AuthService } from './auth-service.service';
import { Observable, of } from 'rxjs';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

describe('AuthGuard', () => {
  let guard: AuthGuardService;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  const routerMock = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerMock },
      ],
    });
    guard = TestBed.inject(AuthGuardService);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should return true if the user is authenticated', (done: DoneFn) => {
    authServiceSpy.isAuthenticated.and.returnValue(of(true));

    const result: Observable<boolean> = guard.canActivate(
      new ActivatedRouteSnapshot(),
      <RouterStateSnapshot>{ url: 'testUrl' }
    ) as Observable<boolean>;

    result.subscribe((res) => {
      expect(res).toBe(true);
      done();
    });
  });

  it('should navigate if the user is un-authenticated', (done: DoneFn) => {
    authServiceSpy.isAuthenticated.and.returnValue(of(false));

    const result: Observable<boolean> = guard.canActivate(
      new ActivatedRouteSnapshot(),
      <RouterStateSnapshot>{ url: 'testUrl' }
    ) as Observable<boolean>;

    result.subscribe((res) => {
      expect(res).toBe(false);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
      done();
    });
  });
});