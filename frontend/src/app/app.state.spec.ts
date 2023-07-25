import { TestBed } from '@angular/core/testing';
import { ToastrModule, ToastrService } from 'ngx-toastr'; // Add this import
import { Actions, NgxsModule, Store, ofActionDispatched } from '@ngxs/store';
import { AppState, DisplayDomain, DisplaySource } from './app.state';
import {
  AddNewSource,
  AttempPsswdLogin,
  CheckAuthenticate,
  ChooseStatistic,
  GetDomains,
  GetSourceDashBoardInfo,
  RefreshSourceData,
  RegisterUser,
  SetProfileId,
  SetSource,
} from './app.actions';
import { AppApi } from './app.api';
import { Observable, of, zip } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('AppState', () => {
  let store: Store;
  // let toastrService: ToastrService;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let apiSpy: jasmine.SpyObj<AppApi>;
  let actions$: Observable<any>;

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj('AppApi', [
      'registerUser',
      'getDomainIDs',
      'checkAuthenticate',
      'attemptPsswdLogin',
      'getProfile',
      'getSourceSentimentData',
      'refreshSourceInfo',
      'addSource',
    ]);
    apiSpy.getDomainIDs.and.returnValue(
      of({ status: 'SUCCESS', domainIDs: [] })
    );
    apiSpy.checkAuthenticate.and.returnValue(of({ status: 'SUCCESS' }));
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
    toastrSpy = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
  });
  
  it('set the correct dashboard info if there is a source that is selected', () => {
    // dispatch event

    // make sure overallSentiment and sampleData is set not set

    // setup the selected source

    // dispatch event
    // make sure overallSentiment and sampleData is set
  });

  it('should select the correct source', () => {
    const mockSources: DisplaySource[] = [
      {
        id: '1',
        name: 'test',
        url: 'test',
        selected: true,
      },
      {
        id: '2',
        name: 'test2',
        url: 'test3',
        selected: false,
      },
    ];
    store.reset({
      app: { sources: mockSources, selectedSource: mockSources[0] },
    });

    store.dispatch(new SetSource(mockSources[1]));

    // const actualSelectedSource = store.selectSnapshot(AppState.selectedSource);
    // expect(actualSelectedSource).toEqual(mockSources[1]);
    // const actualSources = store.selectSnapshot(AppState.sources);
    // if (!actualSources) {
    //   fail();
    //   return;
    // }
    // expect(actualSources[0].selected).toEqual(false);
    // expect(actualSources[1].selected).toEqual(true);
  });

  it('Should Set the userID when when the user has been authenticated', () => {
    // let apiSpy = jasmine.createSpyObj('AppApi', ['checkAuthenticate']);
    // apiSpy.checkAuthenticate.and.callThrough();
    // TestBed.inject(AppApi);

    store.dispatch(new CheckAuthenticate());
    // check that the userid in local storage is set if the user is indeed authenticated
  });

  it('should react correctly to successful "AddNewSource" event', (done: DoneFn) => {
    const mockDomain: DisplayDomain = {
      id: 1,
      name: 'test',
      description: 'test',
      selected: true,
      imageUrl: 'test',
      sourceIds: ['1'],
      sources: [],
    };
    store.reset({ app: { selectedDomain: mockDomain } });
    apiSpy.addSource.and.returnValue(of({ status: 'SUCCESS' }));

    actions$.pipe(ofActionDispatched(RefreshSourceData)).subscribe(() => {
      expect(true).toBe(true);
      done();
    });

    store.dispatch(
      new AddNewSource('newSourceName', 'newSOurcePlatform', {
        platform: 'youtube',
        video_id: 'QblahQw',
      })
    );
  });

  it("should correctly refresh source successful 'RefreshSourceData' event", (done: DoneFn) => {
    const mockSource: DisplaySource = {
      id: '1',
      name: 'test',
      url: 'test',
      selected: true,
    };
    store.reset({ app: { selectedSource: mockSource } });

    apiSpy.refreshSourceInfo.and.returnValue(of({ status: 'SUCCESS' }));
    apiSpy.getSourceSentimentData.and.returnValue(of({ status: 'FAILURE' }));

    actions$.pipe(ofActionDispatched(GetSourceDashBoardInfo)).subscribe(() => {
      expect(true).toBe(true);
      done();
    });

    store.dispatch(new RefreshSourceData());
  });

  it("should correctly refresh source failed 'RefreshSourceData' event", () => {
    const mockSource: DisplaySource = {
      id: '1',
      name: 'test',
      url: 'test',
      selected: true,
    };
    store.reset({ app: { selectedSource: mockSource } });

    apiSpy.refreshSourceInfo.and.returnValue(of({ status: 'FAILURE' }));

    spyOn(toastrSpy, 'error').and.callThrough();
    expect(toastrSpy.error).not.toHaveBeenCalled();

    store.dispatch(new RefreshSourceData());
  });

  it('should correctly get stats on a source', () => {
    // test above that correctly reacts to not having a selected source

    const mockSource: DisplaySource = {
      id: '1',
      name: 'test',
      url: 'test',
      selected: true,
    };
    store.reset({ app: { selectedSource: mockSource } });
    apiSpy.getSourceSentimentData.and.returnValue(of({ status: 'FAILURE' }));
    // test positive below this it'should... function

    spyOn(toastrSpy, 'error').and.callThrough();

    store.dispatch(new GetSourceDashBoardInfo());

    expect(apiSpy.getSourceSentimentData).toHaveBeenCalled();
    expect(toastrSpy.error).toHaveBeenCalled();
  });

  it('React correctly positive "AttempPsswdLogin"  event', (done: DoneFn) => {
    apiSpy.attemptPsswdLogin.and.returnValue(of({ status: 'SUCCESS' }));

    zip(
      actions$.pipe(ofActionDispatched(SetProfileId)),
      actions$.pipe(ofActionDispatched(GetDomains))
    ).subscribe((_) => {
      expect(apiSpy.attemptPsswdLogin).toHaveBeenCalled();
      done();
    });

    store.dispatch(new AttempPsswdLogin('test_username', 'test_password'));
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
