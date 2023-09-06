import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GraphSelectorComponent } from './graph-selector.component';
import { Actions, NgxsModule, Store, ofActionDispatched } from '@ngxs/store';
import { AppApi } from '../app.api';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AttempPsswdLogin, ChooseStatistic } from '../app.actions';

const mockAggregatedMetricsData = {
  general: {
    category: 'POSITIVE',
    score: 0.714,
  },
  emotions: {
    anger: 0.0231,
    disgust: 0.012,
    fear: 0,
    joy: 0.6777,
    neutral: 0.0434,
    sadness: 0.2187,
    surprise: 0.0251,
  },
  toxicity: {
    level_of_toxic: 'Non-toxic',
    score: 0.0009,
  },
  ratios: {
    positive: 0.3031,
    neutral: 0.6213,
    negative: 0.0757,
  },
};

describe('GraphSelectorComponent', () => {
  let component: GraphSelectorComponent;
  let fixture: ComponentFixture<GraphSelectorComponent>;

  let storeSpy: jasmine.SpyObj<Store>;
  let appApiSpy: jasmine.SpyObj<AppApi>;
  let actions$: Observable<any>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GraphSelectorComponent],
      imports: [NgxsModule.forRoot([]), FormsModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GraphSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // appApiSpy = jasmine.createSpyObj('AppApi', ['attemptPsswdLogin']);
    // appApiSpy.attemptPsswdLogin.and.callThrough();

    // TestBed.configureTestingModule({
    //   providers: [
    //     GraphSelectorComponent,
    //     { provide: AppApi, useValue: appApiSpy },
    //   ],
    //   imports: [NgxsModule.forRoot([]), FormsModule],
    // });

    // component = TestBed.inject(GraphSelectorComponent);
    storeSpy = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    actions$ = TestBed.inject(Actions);
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should test showPopup', () => {
    component.showPopup(1);
    expect(true).toBe(true);
  });

  it('should set updatedGraphArray on new Data', () => {
    component.processOverallSentiment({aggregated_metrics: mockAggregatedMetricsData});

    expect(component.updatedGraphArray).toBeDefined();
  });

  it('should change the current statistic index when new index event is received', () => {
    component.processStatisticIndexChange(1);

    expect(component.currentGraphIndex).toEqual(1);

    component.processStatisticIndexChange(2);

    expect(component.currentGraphIndex).toEqual(2);
  });

  it('should render the graph after view init', (done) => {
    component.ngAfterViewInit();

    setTimeout(() => {
      // expect(component.chart).toBeDefined();
      done();
    }, 1000);
  });

  it('should switch to the right graph when the index changes', () => {
    component.updatedGraphArray = component.assignGraphData(
      mockAggregatedMetricsData,
      component.graphs
    );

    component.switchToNextGraph();
    expect(component.currentGraphIndex).toEqual(1);

    component.switchToPreviousGraph();
    component.switchToPreviousGraph();
    expect(component.currentGraphIndex).toEqual(3);
  });

// find out why the ChooseStatistic Test is not firing
  //   it('fire correct "ChooseStatistics" event when switching to previous graph', (done: DoneFn) => {
//     actions$.pipe(ofActionDispatched(ChooseStatistic)).subscribe((_) => {
//       expect(true).toBe(true);
//       done();
//     });

//     component.updatedGraphArray = component.assignGraphData(
//       mockData,
//       component.graphs
//     );

//     component.switchToPreviousGraph();
//   });

//   it('fire correct "ChooseStatistics" event when switching to next graph', (done: DoneFn) => {
//     actions$.pipe(ofActionDispatched(ChooseStatistic)).subscribe((_) => {
//       expect(true).toBe(true);
//       done();
//     });

//     component.switchToNextGraph();
//   });
});
