import { TestBed } from '@angular/core/testing';
import { ToastrModule } from 'ngx-toastr'; // Add this import
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

describe('AppState', () => {
  let store: Store;
  let apiSpy: jasmine.SpyObj<AppApi>;
  let actions$: Observable<any>;

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj('AppApi', [
      'registerUser',
      'getDomainIDs',
      'checkAuthenticate',
      'attemptPsswdLogin',
    ]);
    apiSpy.getDomainIDs.and.returnValue(of({ status: 'SUCCESS', domainIDs: [] }));
    apiSpy.registerUser.and.returnValue(of({ status: 'SUCCESS' }));
    apiSpy.checkAuthenticate.and.returnValue(of({ status: 'SUCCESS' }));
    apiSpy.attemptPsswdLogin.and.returnValue(of({ status: 'SUCCESS' }));

    await TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([AppState]),
        ToastrModule.forRoot(), // Add ToastrModule here
      ],
      providers: [{ provide: AppApi, useValue: apiSpy }],
    }).compileComponents();

    store = TestBed.inject(Store);
    actions$ = TestBed.inject(Actions);
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

  it('React correctly "AttempPsswdLogin" event', (done: DoneFn) => {
    zip(
      actions$.pipe(ofActionDispatched(SetProfileId)),
      actions$.pipe(ofActionDispatched(GetDomains))
    ).subscribe((_) => {
      expect(apiSpy.attemptPsswdLogin).toHaveBeenCalled();
      done();
    });

    store.dispatch(new AttempPsswdLogin('test_username', 'test_password'));
  });

  it('React correctly to registering user', () => {
    // let mockResponse1 = { status: 'SUCCESS' };
    // let apiSpy = jasmine.createSpyObj('AppApi', ['registerUser']);
    // apiSpy.registerUser.and.returnValue(mockResponse1);
    // TestBed.inject(AppApi);

    store.dispatch(new RegisterUser('test', 'test', 'test@test.com'));
    const actual = store.selectSnapshot(AppState.statisticIndex);
    expect(apiSpy.registerUser).toHaveBeenCalled();
  });

  it('Set the selected Statistic Index', () => {
    // let apiSpy = jasmine.createSpyObj('AppApi', ['getDomainIDs']);
    // apiSpy.getDomainIDs.and.callThrough();
    // TestBed.inject(AppApi);

    store.dispatch(new ChooseStatistic(1));

    const actual = store.selectSnapshot(AppState.statisticIndex);
    expect(actual).toEqual(1);
  });
});
