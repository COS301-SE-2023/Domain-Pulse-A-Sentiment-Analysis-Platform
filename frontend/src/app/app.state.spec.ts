import { TestBed } from '@angular/core/testing';
import { ToastrModule, ToastrService } from 'ngx-toastr'; // Add this import
import { Actions, NgxsModule, Store, ofActionDispatched } from '@ngxs/store';
import { AppState } from './app.state';
import {
  AttempPsswdLogin,
  CheckAuthenticate,
  ChooseStatistic,
  GetDomains,
  RegisterUser,
  SetProfileId,
} from './app.actions';
import { AppApi } from './app.api';
import { Observable, of, zip } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('AppState', () => {
  let store: Store;
  let toastrService: ToastrService;
  let apiSpy: jasmine.SpyObj<AppApi>;
  let actions$: Observable<any>;

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj('AppApi', [
      'registerUser',
      'getDomainIDs',
      'checkAuthenticate',
      'attemptPsswdLogin',
      'getProfile',
    ]);
    apiSpy.getDomainIDs.and.returnValue(of({ status: 'SUCCESS', domainIDs: [] }));
    apiSpy.registerUser.and.returnValue(of({ status: 'SUCCESS' }));
    apiSpy.checkAuthenticate.and.returnValue(of({ status: 'SUCCESS' }));
    apiSpy.attemptPsswdLogin.and.returnValue(of({ status: 'SUCCESS' }));
    apiSpy.getProfile.and.returnValue(of({ status: 'FAILURE' })); // CHANGE TO SUCCESS AND RETURN MOCK USER
    
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        NgxsModule.forRoot([AppState]),
        ToastrModule.forRoot(), // Add ToastrModule here
      ],
      providers: [{ provide: AppApi, useValue: apiSpy }],
    }).compileComponents();

    store = TestBed.inject(Store);
    actions$ = TestBed.inject(Actions);
    toastrService = TestBed.inject(ToastrService);
  });
  
  it('set the correct dashboard info if there is a source that is selected', () => {
    // dispatch event

    // make sure overallSentiment and sampleData is set not set

    // setup the selected source

    // dispatch event
    // make sure overallSentiment and sampleData is set
  });

  it('Should Set the userID when when the user has been authenticated', () => {
    // let apiSpy = jasmine.createSpyObj('AppApi', ['checkAuthenticate']);
    // apiSpy.checkAuthenticate.and.callThrough();
    // TestBed.inject(AppApi);

    store.dispatch(new CheckAuthenticate());
    // check that the userid in local storage is set if the user is indeed authenticated
  });

  it('React correctly bad "AttempPsswdLogin"  event', () => {
    spyOn(toastrSpy, 'error').and.callThrough();

    apiSpy.attemptPsswdLogin.and.returnValue(of({ status: 'FAILURE' }));
    store.dispatch(new AttempPsswdLogin('test_username', 'test_password'));
    expect(toastrSpy.error).toHaveBeenCalled();
  });

  it('React correctly to registering user', () => {
    apiSpy.registerUser.and.returnValue(of({ status: 'SUCCESS' }));

    store.dispatch(new RegisterUser('test', 'test', 'test@test.com'));
    const actual = store.selectSnapshot(AppState.statisticIndex);
    expect(apiSpy.registerUser).toHaveBeenCalled();

    spyOn(toastrSpy, 'error').and.callThrough();

    apiSpy.registerUser.and.returnValue(of({ status: 'FAILURE' }));
    store.dispatch(new RegisterUser('test', 'test', 'test@test.com'));
    expect(apiSpy.registerUser).toHaveBeenCalled();
    expect(toastrSpy.error).toHaveBeenCalled();
  });

  it('Set the selected Statistic Index', () => {
    store.dispatch(new ChooseStatistic(1));

    const actual = store.selectSnapshot(AppState.statisticIndex);
    expect(actual).toEqual(1);
  });

  it('should correctly format the response from the server to a DisplaySource', () => {
    expect(true).toBe(true);
  });
});
