import { TestBed } from '@angular/core/testing';
import { Actions, NgxsModule, Store, ofActionDispatched } from '@ngxs/store';
import {
  AppState,
  DisplayDomain,
  DisplaySource,
  ProfileDetails,
  UserDetails,
} from './app.state';
import {
  AddNewSource,
  AttempPsswdLogin,
  ChangeMode,
  ChangePassword,
  ChangeProfileIcon,
  CheckAuthenticate,
  ChooseStatistic,
  DeleteDomain,
  DeleteSource,
  DeleteUser,
  EditSource,
  GenerateReport,
  GetDomains,
  GetSourceDashBoardInfo,
  Logout,
  RefreshSourceData,
  RegisterUser,
  SetDomain,
  SetIsActive,
  SetSource,
  SetUserDetails,
  ToastError,
  ToastSuccess,
  ToggleAddDomainModal,
  ToggleProfileModal,
  UplaodCVSFile,
} from './app.actions';
import { AppApi } from './app.api';
import { Observable, combineLatest, of, zip } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

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
      'changeProfileIcon',
      'deleteUser',
      'changeMode',
      'changePassword',
      'logOut',
      'sendCSVFile',
      'generateReport',
      'removeDomain',
    ]);
    apiSpy.getDomainIDs.and.returnValue(
      of({ status: 'SUCCESS', domainIDs: [] })
    );
    apiSpy.checkAuthenticate.and.returnValue(of({ status: 'SUCCESS' }));
    apiSpy.getProfile.and.returnValue(of({ status: 'FAILURE' })); // CHANGE TO SUCCESS AND RETURN MOCK USER

    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, NgxsModule.forRoot([AppState])],
      providers: [
        { provide: AppApi, useValue: apiSpy },
        { provide: Router, useClass: MockRouter },
      ],
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

    store.dispatch(new SetSource(mockSources[1]));

    setTimeout(() => {
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
      done();
    }, 500);
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

  it('should react correctly to failed "AddNewSource" event', (done: DoneFn) => {
    actions$.pipe(ofActionDispatched(ToastError)).subscribe(() => {
      expect(true).toBe(true);
      done();
    });

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
      status: 'FAILURE',
    };

    store.reset({ app: { selectedDomain: mockDomain, domains: [mockDomain] } });
    apiSpy.addSource.and.returnValue(of(mockSuccessfullResponse));

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

  it('should react correctly to failed "Logout" event', (done: DoneFn) => {
    actions$.pipe(ofActionDispatched(ToastError)).subscribe(() => {
      expect(true).toBe(true);
      done();
    });

    apiSpy.logOut.and.returnValue(of({ status: 'FAILURE' }));

    store.dispatch(new Logout());
  });

  it('should react correctly to successful "Logout" event', (done: DoneFn) => {
    actions$.pipe(ofActionDispatched(ToastSuccess)).subscribe(() => {
      const router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
      const navigateSpy = router.navigate as jasmine.Spy;
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
      done();
    });

    apiSpy.logOut.and.returnValue(of({ status: 'SUCCESS' }));

    store.dispatch(new Logout());
  });

  it('should show toast on no selected source', (done: DoneFn) => {
    actions$.pipe(ofActionDispatched(ToastError)).subscribe(() => {
      expect(true).toBe(true);
      done();
    });

    store.dispatch(new SetIsActive(false));
  });

  it('should react correctly to failed "ChangeMode" event', (done: DoneFn) => {
    actions$.pipe(ofActionDispatched(ToastError)).subscribe(() => {
      expect(true).toBe(true);
      done();
    });

    apiSpy.changeMode.and.returnValue(of({ status: 'FAILURE' }));

    const mockProfileDetails: ProfileDetails = {
      profileId: 1,
      mode: true,
      profileIcon: 'test',
    };
    store.reset({ app: { profileDetails: mockProfileDetails } });

    store.dispatch(new ChangeMode());
  });

  it('should react correctly to successfull "ChangeMode" event', (done: DoneFn) => {
    actions$.pipe(ofActionDispatched(ToastSuccess)).subscribe(() => {
      const currentProfileDetails = store.selectSnapshot(
        AppState.profileDetails
      );
      expect(currentProfileDetails?.mode).toEqual(false);
      expect(currentProfileDetails?.profileIcon).toEqual('test');
      expect(currentProfileDetails?.profileId).toEqual(1);

      done();
    });

    apiSpy.changeMode.and.returnValue(
      of({ status: 'SUCCESS', profileIcon: 'test', mode: false, id: 1 })
    );

    const mockProfileDetails: ProfileDetails = {
      profileId: 1,
      mode: true,
      profileIcon: 'test',
    };
    store.reset({ app: { profileDetails: mockProfileDetails } });

    store.dispatch(new ChangeMode());
  });

  it('should react correctly to failed "ChangePassword" event', (done: DoneFn) => {
    actions$.pipe(ofActionDispatched(ToastError)).subscribe(() => {
      expect(true).toBe(true);
      done();
    });

    apiSpy.changePassword.and.returnValue(of({ status: 'FAILURE' }));

    const mockUserDetails: UserDetails = {
      userId: 1,
      username: 'test',
      email: 'pp@gmail.com',
      profileIconUrl: 'test',
      password: 'test_pass',
    };

    store.reset({ app: { userDetails: mockUserDetails } });

    store.dispatch(new ChangePassword('test_pass', 'test_pass2'));
  });

  it('should react correctly to successful "ChangePassword" event', (done: DoneFn) => {
    actions$.pipe(ofActionDispatched(ToastSuccess)).subscribe(() => {
      const router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
      const navigateSpy = router.navigate as jasmine.Spy;
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
      done();
    });

    apiSpy.changePassword.and.returnValue(of({ status: 'SUCCESS' }));

    const mockUserDetails: UserDetails = {
      userId: 1,
      username: 'test',
      email: 'pp@gmail.com',
      profileIconUrl: 'test',
      password: 'test_pass',
    };

    store.reset({ app: { userDetails: mockUserDetails } });

    store.dispatch(new ChangePassword('test_pass', 'test_pass2'));
  });

  it('should react correctly do Successfull "DeleteUser" event', (done: DoneFn) => {
    actions$.pipe(ofActionDispatched(ToastSuccess)).subscribe(() => {
      const router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
      const navigateSpy = router.navigate as jasmine.Spy;
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
      done();
    });

    apiSpy.deleteUser.and.returnValue(of({ status: 'SUCCESS' }));

    const mockUserDetails: UserDetails = {
      userId: 1,
      username: 'test',
      email: 'mandem@gmail.com',
      profileIconUrl: 'test',
      password: 'test_pass',
    };

    store.reset({ app: { userDetails: mockUserDetails } });

    store.dispatch(new DeleteUser('test', 'test_pass'));
  });

  it('should react correctly do failed "DeleteUser" event', (done: DoneFn) => {
    actions$.pipe(ofActionDispatched(ToastError)).subscribe(() => {
      expect(true).toBe(true);
      done();
    });

    apiSpy.deleteUser.and.returnValue(of({ status: 'FAILURE' }));

    const mockUserDetails: UserDetails = {
      userId: 1,
      username: 'test',
      email: 'mandem@gmail.com',
      profileIconUrl: 'test',
      password: 'test_pass',
    };

    store.reset({ app: { userDetails: mockUserDetails } });

    store.dispatch(new DeleteUser('test', 'test_pass'));
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

  it('should react correclty to successfull ChangeProfileICon event', (done: DoneFn) => {
    apiSpy.changeProfileIcon.and.returnValue(
      of({
        status: 'SUCCESS',
        profileIcon: 'https://not_a_real_icon2.png',
        mode: false,
        profileId: 1,
      })
    );

    // set the profile
    const mockProfile: ProfileDetails = {
      profileId: 1,
      mode: true,
      profileIcon: 'test',
    };
    store.reset({ app: { profileDetails: mockProfile } });

    actions$.pipe(ofActionDispatched(ToastSuccess)).subscribe(() => {
      const newProfileDetails = store.selectSnapshot(AppState.profileDetails);
      expect(newProfileDetails?.profileIcon).toEqual(
        'https://not_a_real_icon2.png'
      );

      done();
    });

    store
      .dispatch(new ChangeProfileIcon('https://not_a_real_icon.png'))
      .subscribe();
  });

  it('should react correctly to failed ChangeProfileICon event', (done: DoneFn) => {
    apiSpy.changeProfileIcon.and.returnValue(of({ status: 'FAILURE' }));

    // set the profile
    const mockProfile: ProfileDetails = {
      profileId: 1,
      mode: true,
      profileIcon: 'test',
    };
    store.reset({ app: { profileDetails: mockProfile } });

    actions$.pipe(ofActionDispatched(ToastError)).subscribe(() => {
      expect(true).toBe(true);
      done();
    });

    store
      .dispatch(new ChangeProfileIcon('https://not_a_real_icon.png'))
      .subscribe();
  });

  it('should react correctly to failed ChangeProfileICon event with no profileIcon', () => {
    // (really just running the empty case)

    store.dispatch(new ChangeProfileIcon('https://not_a_real_icon.png'));
    expect(true).toBe(true);
  });

  it('Set the selected Statistic Index', () => {
    store.dispatch(new ChooseStatistic(1));

    const actual = store.selectSnapshot(AppState.statisticIndex);
    expect(actual).toEqual(1);
  });

  it('should test a positive "UplaodCVSFile" event', (done: DoneFn) => {
    zip(
      actions$.pipe(ofActionDispatched(ToastSuccess)),
      actions$.pipe(ofActionDispatched(GetSourceDashBoardInfo))
    ).subscribe((_) => {
      expect(true).toBe(true);
      done();
    });

    apiSpy.sendCSVFile.and.returnValue(of({ status: 'SUCCESS' }));

    const mockSource: DisplaySource = {
      id: '1',
      name: 'test',
      url: 'test',
      params: 'test',
      selected: true,
      isRefreshing: false,
    };

    store.reset({ app: { selectedSource: mockSource, sources: [mockSource] } });

    const mockFile = new File([''], 'test.csv', { type: 'text/csv' });

    store.dispatch(new UplaodCVSFile(mockFile));
  });

  it('should test a negative "UplaodCVSFile" event', (done: DoneFn) => {
    const mockFile = new File([''], 'test.csv', { type: 'text/csv' });
    // just to run the null case
    store.dispatch(new UplaodCVSFile(mockFile));

    actions$.pipe(ofActionDispatched(ToastError)).subscribe(() => {
      expect(true).toBe(true);
      done();
    });

    apiSpy.sendCSVFile.and.returnValue(of({ status: 'FAILURE' }));

    const mockSource: DisplaySource = {
      id: '1',
      name: 'test',
      url: 'test',
      params: 'test',
      selected: true,
      isRefreshing: false,
    };

    store.reset({ app: { selectedSource: mockSource, sources: [mockSource] } });


    store.dispatch(new UplaodCVSFile(mockFile));
  });
  it('should handle successful report generation', (done: DoneFn) => {
    const domainId = '650579d05ce2576d38fcd99a';

    apiSpy.generateReport.and.returnValue(
      of({ status: 'SUCCESS', url: 'https://example.com/report.pdf' })
    );

    // set the profile

    store.reset({ app: { pdfLoading: true, pdfUrl: 'empty' } });

    actions$.pipe(ofActionDispatched(ToastSuccess)).subscribe(() => {
      const pdfLoading = store.selectSnapshot(AppState.pdfLoading);
      const pdfUrl= store.selectSnapshot(AppState.pdfUrl);
      expect(pdfLoading).toEqual(false);
      expect(pdfUrl).toEqual(
        'https://example.com/report.pdf'
      );

      done();
    });

    store.dispatch(new GenerateReport(domainId));

  });


  it('should handle failed report generation', (done: DoneFn) => {
    const domainId = '650579d05ce2576d38fcd99a';

    apiSpy.generateReport.and.returnValue(of({ status: 'FAILURE' }));

    actions$.pipe(ofActionDispatched(ToastError)).subscribe(() => {
      const state = store.selectSnapshot((state) => state);

      expect(state.app.pdfLoading).toBe(false);

      done();
    });

    store.dispatch(new GenerateReport(domainId));
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
    expect(AppState.platformToIcon('trustpilot')).toEqual(
      'trustpilot-logo.png'
    );
    expect(AppState.platformToIcon('facebook')).toEqual('facebook-logo.png');
    expect(AppState.platformToIcon('instagram')).toEqual('instagram-Icon.png');
    expect(AppState.platformToIcon('reddit')).toEqual('reddit-logo.png');
    expect(AppState.platformToIcon('tripadvisor')).toEqual(
      'tripadvisor-logo.png'
    );
    expect(AppState.platformToIcon('youtube')).toEqual('youtube-logo.png');
    expect(AppState.platformToIcon('googlereviews')).toEqual(
      'google-logo.png'
    );
    expect(AppState.platformToIcon('livereview')).toEqual(
      'live-review-logo.png'
    );
    expect(AppState.platformToIcon('csv')).toEqual('csv-logo.png');
  });

  it('should dispatch ToastError and GetDomains actions on API failure', (done: DoneFn) => {
    const domainID = 'your-domain-id';
  
    apiSpy.removeDomain.and.returnValue(of({ status: 'FAILURE' }));
  
    // Create observables for ToastError and GetDomains actions
    const toastError$ = actions$.pipe(ofActionDispatched(ToastError));
    const getDomains$ = actions$.pipe(ofActionDispatched(GetDomains));
  
    combineLatest([toastError$, getDomains$]).subscribe(() => {
      expect(true).toBe(true);
      done();
    });
  
    store.dispatch(new DeleteDomain(domainID));
  });

  it('should toggle showAddDomainModal', () => {
    store.dispatch(new ToggleAddDomainModal());

    const state = store.selectSnapshot(AppState);

    expect(state.showAddDomainModal).toBe(true);
  });

  it('should toggle showProfileModal', () => {
    store.dispatch(new ToggleProfileModal());

    const state = store.selectSnapshot(AppState);

    expect(state.showProfileModal).toBe(true);
  });
});
