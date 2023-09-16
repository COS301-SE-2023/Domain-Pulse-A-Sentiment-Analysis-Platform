import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GraphSelectorComponent } from './graph-selector.component';
import { Actions, NgxsModule, Store, ofActionDispatched } from '@ngxs/store';
import { AppApi } from '../app.api';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ChartComponent } from 'ng-apexcharts';
import { ElementRef } from '@angular/core';
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

const mockTimeSeriesData = 
  {
    "overall": [
        [
            "2023-09-08T11:17:20",
            10.72
        ],
        [
            "2023-09-08T11:18:07",
            22.876
        ],

    ],
    "emotions": {
        "anger": [
            [
                "2023-09-08T11:17:20",
                65.66
            ],
            [
                "2023-09-08T11:17:41",
                62.377
            ],

        ],
        "sadness": [
            [
                "2023-09-08T11:17:20",
                3.56
            ],
            [
                "2023-09-08T11:17:41",
                16.4552
            ],

        ],
        "joy": [
            [
                "2023-09-08T11:17:20",
                0
            ],
            [
                "2023-09-08T11:17:41",
                0
            ],

        ],
        "disgust": [
            [
                "2023-09-08T11:17:20",
                30.78
            ],
            [
                "2023-09-08T11:17:41",
                29.241
            ],

        ],
        "fear": [
            [
                "2023-09-08T11:17:20",
                0
            ],
            [
                "2023-09-08T11:17:41",
                0.594
            ],

        ],
        "surprise": [
            [
                "2023-09-08T11:17:20",
                0
            ],
            [
                "2023-09-08T11:17:41",
                3.8718
            ],

        ]
    },
    "toxicity": {
        "toxic_count": [
            {
                "x": "2023-09-08",
                "y": 1
            }
        ],
        "overall_helper": [
            {
                "x": "2023-09-08T11:17:20",
                "y": 10.72
            },
            {
                "x": "2023-09-08T11:18:07",
                "y": 22.876
            },

        ]
    },
    "ratios": {
        "pos": [
            [
                "2023-09-08T11:17:20",
                2
            ],
            [
                "2023-09-08T11:17:41",
                5.45
            ],
        ],
        "neu": [
            [
                "2023-09-08T11:17:20",
                22
            ],
            [
                "2023-09-08T11:17:41",
                26.2
            ]
        ],
        "neg": [
            [
                "2023-09-08T11:17:20",
                75
            ],
            [
                "2023-09-08T11:17:41",
                67.5
            ]
        ]
    },
    "num_records": [
        [
            "2023-09-08T11:17:20",
            1
        ],
        [
            "2023-09-08T11:17:41",
            2
        ],
        [
            "2023-09-08T11:17:55",
            3
        ],
    ]
};

const mockGraphData = 
[
  [
    {
      //1.1 overall score
      series: [
        /* 70 */
      ],
      chart: {
        height: '100%',
        type: 'radialBar',
        toolbar: {
          show: true,
        },
        
      },
      plotOptions: {
        radialBar: {
          hollow: {
            size: '70%',
          },
          track: {
            background: '#dadada',
          },
          dataLabels: {
            showOn: 'always',
            name: {
              show: true,
              color: '#61d478',
            },
            value: {
              formatter: function(val:any) {
                return parseInt(val.toFixed(2)) + "%";
              },
            }
          },
        },
      },
      fill: {
        type: 'solid',
        colors: ['#61d478'],
      },
      stroke: {
        lineCap: 'round',
      },
      labels: ['Overall Score'],
    },
    {
      //1.2 overall score time series
      series: [
        {
          name: 'Overall Score',
          data: [

          ],
        },
      ],
      chart: {
        height: '100%',
        type: 'area',
        
      },
      title: {
        text: 'Overall Score over time',
      },
      xaxis: {
        type: 'datetime',
      },
      dataLabels: {
        enabled: false,
      },
      yaxis: [
        {
          labels: {
            formatter: function(val:any) {
              return val.toFixed(0);
            }
          }
        }
      ]

    },
  ],
  [
    {
      //2.1 ratios pie
      series: [
        /* 20, 30, 50 */
      ],
      chart: {
        height: 350,
        type: 'donut',
        toolbar: {
          show: true,
        },
        
      },
      labels: ['Postive', 'Negative', 'Neutral'],
      colors: [
        'rgba(63, 231, 133, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(255, 229, 84, 0.8)',
      ],
      legend: {
        show: true,
        position: 'bottom',
      },
      title: {
        text: 'Postive - Negative - Neutral Ratios',
      },
      dataLabels: {
        enabled: false,
      },
      yaxis: [
        {
          labels: {
            formatter: function(val:any) {
              return val.toFixed(0);
            }
          }
        }
      ]
    },
    {
      //2.2pos-neg-neu ratio
      series: [
        {
          name: 'Positive',
          data: [

          ],
        },
        {
          name: 'Negative',
          data: [

          ],
        },
        {
          name: 'Neutral',
          data: [

          ],
        },
      ],
      chart: {
        type: 'area',
        height: '100%',
        stacked: true,
        events: {
          selection: function (chart: any, e: any) {
            console.log(new Date(e.xaxis.min));
          },
        },
        
      },
      colors: [
        'rgba(63, 231, 133, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(255, 229, 84, 0.8)',
      ],
      dataLabels: {
        enabled: false,
      },
      fill: {
        type: 'gradient',
        gradient: {
          opacityFrom: 0.6,
          opacityTo: 0.8,
        },
      },
      legend: {
        position: 'bottom',
      },
      xaxis: {
        type: 'datetime',
      },
      title: {
        text: 'Positive - Negative - Neutral Ratios over time',
      },
      yaxis: [
        {
          labels: {
            formatter: function(val:any) {
              return val.toFixed(0);
            }
          }
        }
      ]
    },
  ],
  [
    //3.1 emotion ratings

    {
      series: [
        {
          name: 'Proportion of emotions',
          data: [
            /* 20, 30, 10, 5, 8, 27 */
          ],
        },
      ],
      chart: {
        type: 'bar',
        height: '100%',
        
      },
      plotOptions: {
        bar: {
          distributed: true,
          horizontal: true,
          borderRadius: 3,
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        title: {
          text: 'Percentage',
        },
        categories: [
          'anger',
          'disgust',
          'fear',
          'joy',
          'surprise',
          'sadness',
        ],
      },
      title: {
        text: 'Bar Chart of Emotion Ratings',
      },
      colors: [
        'rgba(255, 88, 88, 0.8)',
        'rgba(212, 116, 78, 0.8)',
        'rgba(42, 45, 54, 0.8)',
        'rgba(119, 228, 105, 0.8)',
        'rgba(224, 101, 187, 0.8)',
        'rgba(60, 113, 211, 0.8)',
      ],
    },
    {
      //3.2emotional ratios time series
      series: [
        {
          name: 'Anger',
          data: [

          ],
        },
        {
          name: 'Disgust',
          data: [

          ],
        },
        {
          name: 'Fear',
          data: [

          ],
        },
        {
          name: 'Joy',
          data: [

          ],
        },
        {
          name: 'Surprise',
          data: [

          ],
        },
        {
          name: 'Sadness',
          data: [
          ]
        },
      ],
      chart: {
        height: '100%',
        type: 'area',
        
      },
      title: {
        text: 'Emotion Ratings over time',
      },
      colors: [
        'rgba(255, 88, 88, 0.8)',
        'rgba(212, 116, 78, 0.8)',
        'rgba(42, 45, 54, 0.8)',
        'rgba(119, 228, 105, 0.8)',
        'rgba(224, 101, 187, 0.8)',
        'rgba(60, 113, 211, 0.8)',
      ],
      dataLabels: {
        enabled: false,
      },
      fill: {
        type: 'gradient',
        gradient: {
          opacityFrom: 0.6,
          opacityTo: 0.8,
        },
      },
      legend: {
        position: 'bottom',
      },
      xaxis: {
        type: 'datetime',
      },
      yaxis: [
        {
          labels: {
            formatter: function(val:any) {
              return val.toFixed(0);
            }
          }
        }
      ]
    },
    {
      //3.3 radar emotions
      series: [
        {
          name: 'Emotion Ratings',
          data: [
          ],
        },
      ],
      chart: {
        height: '100%',
        type: 'radar',
        
      },
      title: {
        text: 'Emotions Radar Chart',
      },
      xaxis: {
        categories: [
          'anger',
          'disgust',
          'fear',
          'joy',
          'surprise',
          'sadness',
        ],
      },
      yaxis: {
        show: false,

        labels: {
          formatter: function(val:any) {
            return val.toFixed(0);
          }
        }
          

      },
      plotOptions: {
        radar: {
          polygons: {
            strokeColor: '#e8e8e8',
            fill: {
              colors: ['#f8f8f8', '#fff'],
            },
          },
        },
      },
      colors: ['rgba(255, 99, 133, 0.57)'],
    },
  ],
  [
    //4.1 toxicity pie
    {
      series: [
        /* 3 */
      ],
      chart: {
        height: '100%',
        type: 'radialBar',
        toolbar: {
          show: true,
        },
        
      },
      plotOptions: {
        radialBar: {
          hollow: {
            size: '70%',
          },
          track: {
            background: '#dadada',
          },
          dataLabels: {
            showOn: 'always',
            name: {
              show: true,
              color: '#cf5050',
            },
            value: {
              formatter: function(val:any) {
                return parseInt(val.toFixed(2)) + "%";
              },
            }
          },
        },
      },
      fill: {
        type: 'solid',
        colors: ['#cf5050'],
      },
      stroke: {
        lineCap: 'round',
      },
      labels: ['Toxicity'],
    },

    {
      series: [
        {
          name: 'toxicity',
          type: 'column',
          data: [

          ],
        },
        {
          name: 'Overall Score',
          type: 'line',
          data: [
          ],
        },
      ],
      chart: {
        height: '100%',
        type: 'line',
        colors: ['#fb2600', '#30a800'],
        
      },
      all_series_config: {
        stroke_width: 10,
      },
      plotOptions: {
        bar: {
          columnWidth: '70%', // Adjust the column width as needed
        },
      },
      colors: ['#fb2600', '#30a800'], // Specify the colors for the line and columns
      stroke: {
        curve: 'smooth',
        lineCap: 'round',
      },
      title: {
        text: 'Toxicity over time',
      },
      xaxis: {
        type: 'datetime',
      },

      yaxis: [
        {
          seriesName: 'toxicity',
          axisTicks: {
            show: true,
          },
          axisBorder: {
            show: true,
            color: '#fb3200',
          },
          labels: {
            style: {
              color: '#fb2600',
            },
            formatter: function(val:any) {
              return val.toFixed(0);
            }
          },
          title: {
            text: 'Number of Toxic Comments',
            style: {
              color: '#fb2600',
            },
          },
          tooltip: {
            enabled: true,
          },
        },
        {
          seriesName: 'Overall Score',
          opposite: true,
          axisTicks: {
            show: true,
          },
          axisBorder: {
            show: true,
            color: '#30a800',
          },
          labels: {
            style: {
              color: '#30a800',
            },
            formatter: function(val:any) {
              return val.toFixed(0);
            }
          },
          title: {
            text: 'Overall Score',
            style: {
              color: '#30a800',
            },
          },
        },
      ],
    },
  ],
  [
    {
      //1.2 overall score time series
      series: [
        {
          name: 'Number of Reviews',
          data: [
            /*               ['2023-08-20T00:00', 10],
            ['2023-08-21T03:00', 41],
            ['2023-08-22T06:00', 35],
            ['2023-08-23T00:00', 10],
            ['2023-08-23T03:00', 41],
            ['2023-08-23T06:00', 35],
            ['2023-08-24T00:00', 10],
            ['2023-08-25T03:00', 41],
            ['2023-08-25T06:00', 35],
            ['2023-08-26T00:00', 10],
            ['2023-08-26T03:00', 41],
            ['2023-08-26T06:00', 35],
            ['2023-08-27T00:00', 10],
            ['2023-08-31T03:00', 41],
            ['2023-08-31T06:00', 35],
            // ... other data points */
          ],
        },
      ],
      colors: ['#61d478'],
      chart: {
        height: '100%',
        type: 'area',
        
      },
      title: {
        text: 'Number of Reviews over time',
      },
      xaxis: {
        type: 'datetime',
      },
      dataLabels: {
        enabled: false,
      },
    },
  ],

];



describe('GraphSelectorComponent', () => {
  let component: GraphSelectorComponent;
  let fixture: ComponentFixture<GraphSelectorComponent>;

  let storeSpy: jasmine.SpyObj<Store>;
  let appApiSpy: jasmine.SpyObj<AppApi>;
  let actions$: Observable<any>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GraphSelectorComponent, ChartComponent],
      imports: [NgxsModule.forRoot([]), FormsModule],
      providers: [
        {
          provide: ElementRef,
          useValue: {
            nativeElement: document.createElement('div'),
          },
        },
      ],
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


  

});
