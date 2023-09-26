import { TestBed } from '@angular/core/testing';

import { LoginPageComponent } from './login-page.component';
import { Actions, NgxsModule, Store, ofActionDispatched } from '@ngxs/store';
import { AppApi } from '../app.api';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AttempPsswdLogin } from '../app.actions';
import { ActivatedRoute, ParamMap } from '@angular/router';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let storeSpy: jasmine.SpyObj<Store>;
  let appApiSpy: jasmine.SpyObj<AppApi>;
  let actions$: Observable<any>;

  beforeEach(() => {
    const paramMap = jasmine.createSpyObj<ParamMap>('ParamMap', ['get']);
    paramMap.get.and.returnValue(null); // Mock the get method to return null

    const activatedRoute = {
      snapshot: {
        queryParamMap: paramMap,
      },
    };


    appApiSpy = jasmine.createSpyObj('AppApi', ['attemptPsswdLogin']);
    appApiSpy.attemptPsswdLogin.and.callThrough();

    TestBed.configureTestingModule({
      providers: [LoginPageComponent, { provide: AppApi, useValue: appApiSpy },
        { provide: ActivatedRoute, useValue: activatedRoute },],
      imports: [NgxsModule.forRoot([]), FormsModule],
    });

    component = TestBed.inject(LoginPageComponent);
    storeSpy = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    actions$ = TestBed.inject(Actions);
  });

  it('fire "AttempPsswdLogin" action when register function called', (done) => {
    actions$.pipe(ofActionDispatched(AttempPsswdLogin)).subscribe((_) => {
      expect(true).toBe(true);
      done();
    });

    component.login();
  });

  it('should toggle the forgot password modal', () => {
    component.showForgotPasswordModal = false;
    component.toggleForgotPasswordModal();
    expect(component.showForgotPasswordModal).toBe(true);

    component.showForgotPasswordModal = true;
    component.toggleForgotPasswordModal();
    expect(component.showForgotPasswordModal).toBe(false);
  });

  it('should evaluate user', () => {
    spyOn(storeSpy, 'dispatch');

    component.evaluateUser('guest');
    expect(storeSpy.dispatch).toHaveBeenCalled();

    component.evaluateUser(null);
    expect(storeSpy.dispatch).toHaveBeenCalledTimes(1);
  });

});
