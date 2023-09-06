import { TestBed } from '@angular/core/testing';
import { Actions, NgxsModule, Store, ofActionDispatched } from '@ngxs/store';
import {
  AppState,
  DisplayDomain,
  DisplaySource,
  UserDetails,
} from './app.state';
import {
  AddNewSource,
  AttempPsswdLogin,
  CheckAuthenticate,
  ChooseStatistic,
  DeleteSource,
  EditSource,
  GetDomains,
  GetSourceDashBoardInfo,
  RefreshSourceData,
  RegisterUser,
  SetDomain,
  SetIsActive,
  SetSource,
  SetUserDetails,
  ToastError,
  ToastSuccess,
} from './app.actions';
import { AppApi } from './app.api';
import { Observable, of, zip } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('AppState', () => {
  let store: Store;
  let apiSpy: jasmine.SpyObj<AppApi>;
  let actions$: Observable<any>;

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj('AppApi', [
      'registerUser',
      'getDomainIDs',
      'getDomainInfo',
      'checkAuthenticate',
      'attemptPsswdLogin',
      'getProfile',
      'getSourceSentimentData',
      'refreshSourceInfo',
      'addSource',
      'getAggregatedDomainData',
      'editSource',
      'deleteSource',
      'setIsActive',
    ]);
    apiSpy.getDomainIDs.and.returnValue(
      of({ status: 'SUCCESS', domainIDs: [] })
    );
    apiSpy.checkAuthenticate.and.returnValue(of({ status: 'SUCCESS' }));
    apiSpy.getProfile.and.returnValue(of({ status: 'FAILURE' })); // CHANGE TO SUCCESS AND RETURN MOCK USER

    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, NgxsModule.forRoot([AppState])],
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

  it('GetDomains should fail on api "failure"', (done: DoneFn) => {
    actions$.pipe(ofActionDispatched(ToastError)).subscribe(() => {
      expect(true).toBe(true);
      done();
    });

    const mockUser: UserDetails = {
      userId: 1,
      username: 'test',
      email: 'test@thugger.com',
      profileIconUrl: 'test',
    };
    store.reset({ app: { userDetails: mockUser } });
    apiSpy.getDomainIDs.and.returnValue(of({ status: 'FAILURE' }));

    store.dispatch(new GetDomains());
  });

  it('GetDomains should fail on api "success"', () => {
    const mockProfile: UserDetails = {
      userId: 1,
      username: 'test',
      email: 'test@thugger.com',
      profileIconUrl: 'test',
    };
    store.reset({ app: { userDetails: mockProfile } });
    apiSpy.getAggregatedDomainData.and.returnValue(of({ status: 'FAILURE' }));
    apiSpy.getDomainIDs.and.returnValue(
      of({ status: 'SUCCESS', domainIDs: ['dskjafl', 'sdjfkl'] })
    );
    apiSpy.getDomainInfo.and.callFake((domainID: string) => {
      if (domainID === 'dskjafl') {
        return of({
          status: 'SUCCESS',
          domain: {
            _id: '1',
            name: 'test',
            description: 'test',
            icon: 'test',
            sources: [],
          },
        });
      } else {
        return of({
          status: 'SUCCESS',
          domain: {
            _id: '2',
            name: 'test2',
            description: 'test2',
            icon: 'test2',
            sources: [],
          },
        });
      }
    });

    store.dispatch(new GetDomains());

    const expectedDomains: DisplayDomain[] = [
      {
        id: '1',
        name: 'test',
        description: 'test',
        selected: true,
        imageUrl: 'test',
        sourceIds: [],
        sources: [],
      },
      {
        id: '2',
        name: 'test2',
        description: 'test2',
        selected: false,
        imageUrl: 'test2',
        sourceIds: [],
        sources: [],
      },
    ];

    const actualDomains = store.selectSnapshot(AppState.domains);
    expect(actualDomains).toEqual(expectedDomains);
  });

  it('should dispatch ToastError when no selected source to edit', (done: DoneFn) => {
    actions$.pipe(ofActionDispatched(ToastError)).subscribe(() => {
      done();
    });

    store.dispatch(new EditSource('New Source Name'));
  });

  it('should dispatch ToastError when editSource API call fails', (done: DoneFn) => {
    apiSpy.editSource.and.returnValue(of({ status: 'FAILURE' }));

    actions$.pipe(ofActionDispatched(ToastError)).subscribe(() => {
      done();
    });

    const dummySource: DisplaySource = {
      id: '1',
      name: 'test',
      url: 'test',
      params: 'test',
      selected: true,
      isRefreshing: false,
    };

    store.reset({
      app: { sources: [dummySource], selectedSource: dummySource },
    });
    store.dispatch(new EditSource('New Source Name'));
  });

  it('should select the correct domain on "SetDomain" event', () => {
    const mockDomains: DisplayDomain[] = [
      {
        id: '1',
        name: 'test',
        description: 'test',
        selected: true,
        imageUrl: 'test',
        sourceIds: ['1'],
        sources: [],
      },
      {
        id: '2',
        name: 'test2',
        description: 'test2',
        selected: false,
        imageUrl: 'test2',
        sourceIds: ['4', '5'],
        sources: [],
      },
    ];
    store.reset({
      app: { domains: mockDomains, selectedDomain: mockDomains[0] },
    });

    store.dispatch(new SetDomain(mockDomains[1]));

    const actualSelectedDomain = store.selectSnapshot(AppState.selectedDomain);
    expect(actualSelectedDomain).toEqual(mockDomains[1]);
    const actualDomains = store.selectSnapshot(AppState.domains);
    if (!actualDomains) {
      fail();
      return;
    }
    expect(actualDomains[0].selected).toEqual(false);
    expect(actualDomains[1].selected).toEqual(true);
  });

  it('should select the correct source on "SetSource" event', (done: DoneFn) => {
    const mockSources: DisplaySource[] = [
      {
        id: '1',
        name: 'test',
        url: 'test',
        params: 'test',
        selected: true,
        isRefreshing: false,
      },
      {
        id: '2',
        name: 'test2',
        url: 'test3',
        params: 'test',
        selected: false,
        isRefreshing: false,
      },
    ];
    store.reset({
      app: { sources: mockSources, selectedSource: mockSources[0] },
    });

    apiSpy.getSourceSentimentData.and.returnValue(of({ status: 'SUCCESS' }));

    store.dispatch(new SetSource(mockSources[1])).subscribe(() => {
      const actualSelectedSource = store.selectSnapshot(
        AppState.selectedSource
      );
      expect(actualSelectedSource).toEqual(mockSources[1]);
      const actualSources = store.selectSnapshot(AppState.sources);
      if (!actualSources) {
        fail();
        return;
      }
      expect(actualSources[0].selected).toEqual(false);
      expect(actualSources[1].selected).toEqual(true);
      done()
    });
  });

  it('should react correctly to successful "AddNewSource" event', (done: DoneFn) => {
    const mockDomain: DisplayDomain = {
      id: '1',
      name: 'test',
      description: 'test',
      selected: true,
      imageUrl: 'test',
      sourceIds: [],
      sources: [],
    };

    const mockSuccessfullResponse: any = {
      status: 'SUCCESS',
      domain: {
        _id: '64c4dd5e9194ca8be06ba96c',
        name: 'Tutman',
        icon: 'f1-logo.png',
        description: 'None',
        sources: [
          {
            source_id: '2',
            source_name: 'Fresh boat',
            source_icon: 'youtube-logo.png',
            last_refresh_timestamp: 1690624522.0,
            params: {
              source_type: 'youtube',
              video_id: 'eYDKY6jUa4Q',
            },
          },
        ],
        new_source_id: '2',
      },
    };

    store.reset({ app: { selectedDomain: mockDomain, domains: [mockDomain] } });
    apiSpy.addSource.and.returnValue(of(mockSuccessfullResponse));
    apiSpy.getSourceSentimentData.and.returnValue(of({ status: 'FAILURE' }));
    apiSpy.refreshSourceInfo.and.returnValue(of({ status: 'FAILURE' }));

    actions$.pipe(ofActionDispatched(RefreshSourceData)).subscribe(() => {
      const actualSources = store.selectSnapshot(AppState.sources);
      if (!actualSources) {
        fail();
        return;
      }
      expect(actualSources.length).toEqual(1);

      const actaulSelectredomain = store.selectSnapshot(
        AppState.selectedDomain
      );
      if (!actaulSelectredomain) {
        fail();
        return;
      }
      expect(actaulSelectredomain.sourceIds.length).toEqual(1);
      done();
    });

    store.dispatch(
      new AddNewSource('newSourceName', 'newSOurcePlatform', {
        platform: 'youtube',
        video_id: 'QblahQw',
      })
    );
  });

  it("should correctly refresh source failed 'RefreshSourceData' event", (done: DoneFn) => {
    actions$.pipe(ofActionDispatched(ToastError)).subscribe(() => {
      expect(true).toBe(true);
      done();
    });

    const mockSource: DisplaySource = {
      id: '1',
      name: 'test',
      url: 'test',
      params: 'test',
      selected: true,
      isRefreshing: false,
    };
    store.reset({ app: { selectedSource: mockSource } });

    apiSpy.refreshSourceInfo.and.returnValue(of({ status: 'FAILURE' }));

    store.dispatch(new RefreshSourceData());
  });

  it("should correctly refresh source successful 'RefreshSourceData' event", (done: DoneFn) => {
    const mockSource: DisplaySource = {
      id: '1',
      name: 'test',
      url: 'test',
      params: 'test',
      selected: true,
      isRefreshing: false,
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

  it('should correctly get stats on a source', (done: DoneFn) => {
    actions$.pipe(ofActionDispatched(ToastError)).subscribe(() => {
      expect(true).toBe(true);
      done();
    });
    // test above that correctly reacts to not having a selected source

    const mockSource: DisplaySource = {
      id: '1',
      name: 'test',
      url: 'test',
      params: 'test',
      selected: true,
      isRefreshing: false,
    };
    store.reset({ app: { selectedSource: mockSource } });
    apiSpy.getSourceSentimentData.and.returnValue(of({ status: 'FAILURE' }));
    // test positive below this it'should... function

    store.dispatch(new GetSourceDashBoardInfo());

    expect(apiSpy.getSourceSentimentData).toHaveBeenCalled();
  });

  it('React correctly positive "AttempPsswdLogin"  event', (done: DoneFn) => {
    apiSpy.attemptPsswdLogin.and.returnValue(of({ status: 'SUCCESS' }));

    zip(
      actions$.pipe(ofActionDispatched(SetUserDetails)),
      actions$.pipe(ofActionDispatched(GetDomains))
    ).subscribe((_) => {
      expect(apiSpy.attemptPsswdLogin).toHaveBeenCalled();
      done();
    });

    store.dispatch(new AttempPsswdLogin('test_username', 'test_password'));
  });

  it('React correctly bad "AttempPsswdLogin"  event', (done: DoneFn) => {
    actions$.pipe(ofActionDispatched(ToastError)).subscribe(() => {
      expect(true).toBe(true);
      done();
    });

    apiSpy.attemptPsswdLogin.and.returnValue(of({ status: 'FAILURE' }));
    store.dispatch(new AttempPsswdLogin('test_username', 'test_password'));
  });

  it('React correctly to successful registering, and JWT set', () => {
    apiSpy.registerUser.and.returnValue(
      of({ status: 'SUCCESS', JWT: 'testJWT' })
    );

    store.dispatch(new RegisterUser('test', 'test', 'test@test.com'));
    expect(apiSpy.registerUser).toHaveBeenCalled();
    const JWT = localStorage.getItem('JWT');
    expect(JWT).toBe('testJWT');
  });

  it('React correctly to failed registering', (done: DoneFn) => {
    actions$.pipe(ofActionDispatched(ToastError)).subscribe(() => {
      expect(true).toBe(true);
      done();
    });

    apiSpy.registerUser.and.returnValue(of({ status: 'FAILURE' }));
    store.dispatch(new RegisterUser('test', 'test', 'test@test.com'));
    expect(apiSpy.registerUser).toHaveBeenCalled();
  });

  it('should show toast on no selected source', (done: DoneFn) => {
    actions$.pipe(ofActionDispatched(ToastError)).subscribe(() => {
      expect(true).toBe(true);
      done();
    });

    store.dispatch(new SetIsActive(false));
  });

  it('should show toast on fialed "SetIsActive"', (done: DoneFn) => {
    apiSpy.setIsActive.and.returnValue(of({ status: 'FAILURE' }));

    actions$.pipe(ofActionDispatched(ToastError)).subscribe(() => {
      expect(true).toBe(true);
      done();
    });

    const mockSource: DisplaySource = {
      id: '1',
      name: 'test',
      url: 'test',
      params: 'test',
      selected: true,
      isRefreshing: false,
    };
    store.reset({ app: { selectedSource: mockSource } });

    store.dispatch(new SetIsActive(true));
  });

  it('should show toast on success "SetIsActive"', (done: DoneFn) => {
    apiSpy.setIsActive.and.returnValue(of({ status: 'SUCCESS' }));

    actions$.pipe(ofActionDispatched(ToastSuccess)).subscribe(() => {
      expect(true).toBe(true);
      done();
    });

    const mockSource: DisplaySource = {
      id: '1',
      name: 'test',
      url: 'test',
      params: 'test',
      selected: true,
      isRefreshing: false,
    };
    store.reset({ app: { selectedSource: mockSource, sources: [mockSource] } });

    store.dispatch(new SetIsActive(true));
  });

  it('Set the selected Statistic Index', () => {
    store.dispatch(new ChooseStatistic(1));

    const actual = store.selectSnapshot(AppState.statisticIndex);
    expect(actual).toEqual(1);
  });

  it('should correctly format the response from the server to a DisplaySOurce', () => {
    let mockResponseSources: any[] = [
      {
        source_id: '64b940ec9bbccdb7731b81f9',
        source_name: 'Primegen 1',
        source_icon: 'youtube-logo.png',
        last_refresh_timestamp: 1689878247.0,
        params: {
          source_type: 'youtube',
          video_id: 'WjKQQAFwrR4',
        },
      },
      {
        source_id: '64ba5fb1303c5fdb91cc4c5e',
        source_name: 'Linus 1',
        source_icon: 'youtube-logo.png',
        last_refresh_timestamp: 1689936239.0,
        params: {
          source_type: 'youtube',
          maps_url: 'RGZFb2PlPlo',
        },
      },
      {
        source_id: '64ba5fb1303c5fdb91cc4c5e',
        source_name: 'Primeagen 3',
        source_icon: 'youtube-logo.png',
        last_refresh_timestamp: 1689936239.0,
        params: {
          source_type: 'youtube',
          tripadvisor_url: 'RGZFb2PlPlo',
        },
      },
      {
        source_id: '64b940ec9bbccdb7731b81f9',
        source_name: 'Primegen survey',
        source_icon: 'youtube-logo.png',
        last_refresh_timestamp: 1689878247.0,
        params: {
          source_type: 'livereview',
          is_active: true,
        },
      },
    ];

    let expected: DisplaySource[] = [
      {
        id: '64b940ec9bbccdb7731b81f9',
        name: 'Primegen 1',
        url: 'youtube-logo.png',
        params: 'WjKQQAFwrR4',
        selected: false,
        isRefreshing: false,
      },
      {
        id: '64ba5fb1303c5fdb91cc4c5e',
        name: 'Linus 1',
        url: 'youtube-logo.png',
        params: 'RGZFb2PlPlo',
        selected: false,
        isRefreshing: false,
      },
      {
        id: '64ba5fb1303c5fdb91cc4c5e',
        name: 'Primeagen 3',
        url: 'youtube-logo.png',
        params: 'RGZFb2PlPlo',
        selected: false,
        isRefreshing: false,
      },
      {
        id: '64b940ec9bbccdb7731b81f9',
        name: 'Primegen survey',
        url: 'youtube-logo.png',
        params: true,
        selected: false,
        isRefreshing: false,
      },
    ];

    let actual = AppState.formatResponseSources(mockResponseSources);

    expect(actual).toEqual(expected);
  });

  it('should choose the correct source icon for the platform', () => {
    expect(AppState.platformToIcon('facebook')).toEqual('facebook-logo.png');
    expect(AppState.platformToIcon('instagram')).toEqual('instagram-Icon.png');
    expect(AppState.platformToIcon('reddit')).toEqual('reddit-logo.png');
    expect(AppState.platformToIcon('tripadvisor')).toEqual(
      'tripadvisor-logo.png'
    );
    expect(AppState.platformToIcon('youtube')).toEqual('youtube-logo.png');
    expect(AppState.platformToIcon('googlereviews')).toEqual(
      'google-reviews.png'
    );
    expect(AppState.platformToIcon('livereview')).toEqual(
      'live-review-logo.png'
    );
  });
});
