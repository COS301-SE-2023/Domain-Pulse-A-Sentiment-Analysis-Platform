import { TestBed } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { AppState } from './app.state';
import {
  CheckAuthenticate,
  ChooseStatistic,
  RegisterUser,
} from './app.actions';
import { AppApi } from './app.api';
import { of } from 'rxjs';

describe('AppState', () => {
  let store: Store;
  let apiSpy: jasmine.SpyObj<AppApi>;

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj('AppApi', [
      'registerUser',
      'getDomainIDs',
      'checkAuthenticate',
    ]);
    apiSpy.getDomainIDs.and.callThrough();
    apiSpy.registerUser.and.returnValue(of({ status: 'SUCCESS' }));
    apiSpy.checkAuthenticate.and.returnValue(of({ status: 'SUCCESS' }));

    await TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([AppState])],
      providers: [{ provide: AppApi, useValue: apiSpy }],
      //   teardown: { destroyAfterEach: false },
    }).compileComponents();

    store = TestBed.inject(Store);
  });

  it('Should Set the userID when when the user has been authenticated', () => {
    // let apiSpy = jasmine.createSpyObj('AppApi', ['checkAuthenticate']);
    // apiSpy.checkAuthenticate.and.callThrough();
    // TestBed.inject(AppApi);

    store.dispatch(new CheckAuthenticate());
    // check that the userid in local storage is set if the user is indeed authenticated
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
