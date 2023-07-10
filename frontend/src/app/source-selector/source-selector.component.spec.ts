import { TestBed } from '@angular/core/testing';

import { SourceSelectorComponent } from './source-selector.component';
import { Actions, NgxsModule, Store, ofActionDispatched } from '@ngxs/store';
import { AppApi } from '../app.api';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AttempPsswdLogin, SetSource } from '../app.actions';
import { DisplaySource } from '../app.state';

describe('SourceSelectorComponent', () => {
  let component: SourceSelectorComponent;
  let storeSpy: jasmine.SpyObj<Store>;
  let appApiSpy: jasmine.SpyObj<AppApi>;
  let actions$: Observable<any>;

  beforeEach(() => {
    appApiSpy = jasmine.createSpyObj('AppApi', ['getSourceSentimentData']);
    appApiSpy.getSourceSentimentData.and.callThrough();

    // appStateSpy = jasmine.createSpyObj('AppState', ['setSource']);
    // appStateSpy.setSource.and.callThrough();

    TestBed.configureTestingModule({
      providers: [SourceSelectorComponent, { provide: AppApi, useValue: appApiSpy }],
      imports: [NgxsModule.forRoot([]), FormsModule],
    });

    component = TestBed.inject(SourceSelectorComponent);
    storeSpy = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    actions$ = TestBed.inject(Actions);
  });

  it('should fire the "SetSource" action when selectSource function called', (done) => {
    actions$.pipe(ofActionDispatched(SetSource)).subscribe((_) => {
      expect(true).toBe(true);
      done();
    });

    const dummyDisplaySource: DisplaySource = {
      id: 1,
      name: 'test',
      url: 'test',
      selected: true,
    };

    component.selectSource(dummyDisplaySource);
  });
});
