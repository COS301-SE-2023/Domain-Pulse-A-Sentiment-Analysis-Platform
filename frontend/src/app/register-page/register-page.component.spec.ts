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
});
