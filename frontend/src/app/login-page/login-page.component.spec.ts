import { TestBed } from '@angular/core/testing';

import { LoginPageComponent } from './login-page.component';
import { Actions, NgxsModule, Store, ofActionDispatched } from '@ngxs/store';
import { AppApi } from '../app.api';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AttempPsswdLogin } from '../app.actions';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let storeSpy: jasmine.SpyObj<Store>;
  let appApiSpy: jasmine.SpyObj<AppApi>;
  let actions$: Observable<any>;

  beforeEach(() => {
    appApiSpy = jasmine.createSpyObj('AppApi', ['attemptPsswdLogin']);
    appApiSpy.attemptPsswdLogin.and.callThrough();

    TestBed.configureTestingModule({
      providers: [LoginPageComponent, { provide: AppApi, useValue: appApiSpy }],
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
});
