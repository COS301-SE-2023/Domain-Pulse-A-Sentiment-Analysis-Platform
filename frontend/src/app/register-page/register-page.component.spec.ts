import { TestBed } from '@angular/core/testing';

import { RegisterPageComponent } from './register-page.component';
import { Actions, NgxsModule, Store, ofActionDispatched } from '@ngxs/store';
import { AppApi } from '../app.api';
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { RegisterUser } from '../app.actions';

describe('RegisterPageComponent', () => {
  let component: RegisterPageComponent;
  let storeSpy: jasmine.SpyObj<Store>;
  let appApiSpy: jasmine.SpyObj<AppApi>;
  let actions$: Observable<any>;

  beforeEach(() => {
    appApiSpy = jasmine.createSpyObj('AppApi', ['registerUser']);
    appApiSpy.registerUser.and.returnValue(of({ status: 'SUCCESS' }));

    TestBed.configureTestingModule({
      providers: [
        RegisterPageComponent,
        { provide: AppApi, useValue: appApiSpy },
      ],
      imports: [NgxsModule.forRoot([]), FormsModule],
    });

    component = TestBed.inject(RegisterPageComponent);
    storeSpy = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    actions$ = TestBed.inject(Actions);
    // spyOn(storeSpy, 'dispatch').and.callThrough();
  });

  it('fire "RegisterUser" action when register function called', (done) => {
    actions$.pipe(ofActionDispatched(RegisterUser)).subscribe((_) => {
      expect(true).toBe(true);
done();
    });

    component.register();
  });

  it('should toggle password visibility', () => {
    // Initially, passwordVisible should be falsy
    expect(component.passwordVisible).toBeFalsy();

    // Call togglePasswordVisibility to toggle it
    component.togglePasswordVisibility();

    // Now, passwordVisible should be truthy
    expect(component.passwordVisible).toBeTruthy();

    // Call togglePasswordVisibility again to toggle it back
    component.togglePasswordVisibility();

    // Now, passwordVisible should be falsy again
    expect(component.passwordVisible).toBeFalsy();
  });

  it('should return the correct password type', () => {
    // Initially, passwordVisible should be falsy
    expect(component.passwordVisible).toBeFalsy();

    // Call getPasswordType, it should return 'password'
    expect(component.getPasswordType()).toBe('password');

    // Toggle password visibility
    component.togglePasswordVisibility();

    // Now, passwordVisible should be truthy
    expect(component.passwordVisible).toBeTruthy();

    // Call getPasswordType again, it should return 'text'
    expect(component.getPasswordType()).toBe('text');
  });

  it('should toggle password confirm visibility', () => {
    // Initially, passwordVisible should be falsy
    expect(component.confirmPasswordVisible).toBeFalsy();

    // Call togglePasswordVisibility to toggle it
    component.togglePasswordVisibility();

    // Now, passwordVisible should be truthy
    expect(component.passwordVisible).toBeTruthy();

    // Call togglePasswordVisibility again to toggle it back
    component.togglePasswordVisibility();

    // Now, passwordVisible should be falsy again
    expect(component.confirmPasswordVisible).toBeFalsy();
  });

  it('should return the correct confirm password type', () => {
    // Initially, passwordVisible should be falsy
    expect(component.confirmPasswordVisible).toBeFalsy();

    // Call getPasswordType, it should return 'password'
    expect(component.getConfirmPasswordType()).toBe('password');

    // Toggle password visibility
    component.toggleConfirmPasswordVisibility();

    // Now, passwordVisible should be truthy
    expect(component.confirmPasswordVisible).toBeTruthy();

    // Call getPasswordType again, it should return 'text'
    expect(component.getConfirmPasswordType()).toBe('text');
  });
});
