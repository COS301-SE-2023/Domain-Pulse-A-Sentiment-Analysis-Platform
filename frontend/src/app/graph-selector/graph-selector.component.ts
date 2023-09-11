import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as Chart from 'chart.js';
import { Select, Store } from '@ngxs/store';
import { AppState } from '../app.state';
import { Observable } from 'rxjs';
import { ChooseStatistic } from '../app.actions';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexYAxis,
  ApexLegend,
  ApexFill,
  ApexResponsive,
  ApexPlotOptions,
  ApexNonAxisChartSeries,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  series2: ApexNonAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
  dataLabels: ApexDataLabels;
  colors: string[];
  legend: ApexLegend;
  fill: ApexFill;
  yaxis: ApexYAxis;
  responsive: ApexResponsive[];
  plotOptions: ApexPlotOptions;
  labels: any;
  stroke: any;
  annotations: any;
};

@Component({
  selector: 'graph-selector',
  templateUrl: './graph-selector.component.html',
  styleUrls: ['./graph-selector.component.sass'],
})
export class GraphSelectorComponent implements OnInit {
  @ViewChild('myChart') myChart!: ElementRef;
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  @ViewChild('chart')
  chart!: ChartComponent;
  chartOptions!: Partial<ChartOptions>;

  @Select(AppState.sourceOverallSentimentScores)
  sourceOverallSentiment!: Observable<any | null>;
  @Select(AppState.statisticIndex) statisticIndex!: Observable<number>;
  currentGraphIndex: number = 0;
  currentStatisticIndex: number = 0;
  dots = [2, 2, 3, 2, 1];
  selectedDotIndex = this.currentGraphIndex;
  @Select(AppState.sourceIsLoading) sourceIsLoading$!: Observable<boolean>;

  chartOptionsArray: any[] | Partial<ChartOptions>[] = [
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
              /*               ['2023-08-20T00:00', 10],
              ['2023-08-21T03:00', 10],
              ['2023-08-22T06:00', 40],
              ['2023-08-23T00:00', 0],
              ['2023-08-23T03:00', 10], */
            ],
          },
          {
            name: 'Negative',
            data: [
              /*               ['2023-08-20T00:00', 10],
              ['2023-08-21T03:00', 60],
              ['2023-08-22T06:00', 40],
              ['2023-08-23T00:00', 50],
              ['2023-08-23T03:00', 40], */
            ],
          },
          {
            name: 'Neutral',
            data: [
              /*               ['2023-08-20T00:00', 10],
              ['2023-08-21T03:00', 30],
              ['2023-08-22T06:00', 20],
              ['2023-08-23T00:00', 50],
              ['2023-08-23T03:00', 40], */
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
              /* ['2023-08-20T00:00', 10],
              ['2023-08-21T03:00', 10],
              ['2023-08-22T06:00', 40],
              ['2023-08-23T00:00', 0],
              ['2023-08-23T03:00', 10],*/
            ],
          },
          {
            name: 'Disgust',
            data: [
              ['2023-08-20T00:00', 10],
              ['2023-08-21T03:00', 60],
              ['2023-08-22T06:00', 40],
              ['2023-08-23T00:00', 50],
              ['2023-08-23T03:00', 40],
            ],
          },
          {
            name: 'Fear',
            data: [
              ['2023-08-20T00:00', 10],
              ['2023-08-21T03:00', 30],
              ['2023-08-22T06:00', 20],
              ['2023-08-23T00:00', 50],
              ['2023-08-23T03:00', 40],
            ],
          },
          {
            name: 'Joy',
            data: [
              ['2023-08-20T00:00', 10],
              ['2023-08-21T03:00', 10],
              ['2023-08-22T06:00', 40],
              ['2023-08-23T00:00', 0],
              ['2023-08-23T03:00', 10],
            ],
          },
          {
            name: 'Surprise',
            data: [
              ['2023-08-20T00:00', 10],
              ['2023-08-21T03:00', 60],
              ['2023-08-22T06:00', 40],
              ['2023-08-23T00:00', 50],
              ['2023-08-23T03:00', 40],
            ],
          },
          {
            name: 'Sadness',
            data: [
              ['2023-08-20T00:00', 10],
              ['2023-08-21T03:00', 30],
              ['2023-08-22T06:00', 20],
              ['2023-08-23T00:00', 50],
              ['2023-08-23T03:00', 40],
            ],
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
              /* 0.05, 0.1, 0.15, 0.35, 0.25, 0.15 */
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
              /* 
              { x: '2023-08-20', y: 5 },
              { x: '2023-08-21', y: 6 },
              { x: '2023-08-22', y: 20 },
              { x: '2023-08-27', y: 10 },
  
  
              { x: '2023-08-31', y: 2 },
              { x: '2023-08-31', y: 1 }, */
            ],
          },
          {
            name: 'Overall Score',
            type: 'line',
            data: [
              { x: '2023-08-20T00:00', y: 10 },
              { x: '2023-08-21T03:00', y: 41 },
              { x: '2023-08-22T06:00', y: 35 },
              { x: '2023-08-23T00:00', y: 10 },
              { x: '2023-08-23T03:00', y: 41 },
              { x: '2023-08-23T06:00', y: 35 },
              { x: '2023-08-24T00:00', y: 10 },
              { x: '2023-08-25T03:00', y: 41 },
              { x: '2023-08-25T06:00', y: 35 },
              { x: '2023-08-26T00:00', y: 10 },
              { x: '2023-08-26T03:00', y: 41 },
              { x: '2023-08-26T06:00', y: 35 },
              { x: '2023-08-27T00:00', y: 10 },
              { x: '2023-08-31T03:00', y: 41 },
              { x: '2023-08-31T06:00', y: 35 },
              // ... other data points
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

    // Add more chartOptions as needed
  ];
  //chart: Chart | undefined;
  //gradient: CanvasGradient | undefined;
  /*  graphs = [
    {
      type: 'doughnut',
      fontColor: 'white',
      data: {
        labels: ['Overall Score'],
        datasets: [
          {
            data: [],
            backgroundColor: [
              'rgba(3, 127, 255, 1)',
              'rgba(170, 170, 170, 0.71)',
              'rgba(0, 0, 0, 0)',
            ],
            borderWidth: 0,
          },
        ],
      },
      options: {
        onClick: (event: any, elements: string | any[]) => {
          if (elements && elements.length > 0) {
            const clickedIndex = elements[0]._index;
            this.showPopup(clickedIndex);
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        cutout: '50%',
        rotation: 1 * Math.PI,
        tooltips: {
          enabled: false,
        },
        plugins: {
          legend: {
            display: false,
          },
          labels: {
            fontColor: 'white',
          },
        },
      },
    },
    {
      type: 'pie',
      data: {
        labels: ['Positive', 'Negative', 'Neutral'],
        datasets: [
          {
            data: [],
            backgroundColor: [
              'rgba(75, 192, 192, 0.8)',
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
            ],
            borderColor: [
              'rgba(75, 192, 192, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        onClick: (event: any, elements: string | any[]) => {
          if (elements && elements.length > 0) {
            const clickedIndex = elements[0]._index;
            this.showPopup(clickedIndex);
          }
        },
      },
    },
    {
      type: 'bar',
      data: {
        labels: [
          'anger',
          'disgust',
          'fear',
          'joy',
          'neutral',
          'sadness',
          'surprise',
        ],
        datasets: [
          {
            label: 'Rating per Emotion',
            data: [],
            backgroundColor: [
              'rgba(3, 127, 255, 0.8)',
              'rgba(145, 44, 246, 0.8)',
              'rgba(23, 35, 76, 0.8)',
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)',

              'rgba(75, 192, 192, 0.8)',
            ],

            borderColor: [
              'rgba(3, 127, 255, 1)',
              'rgba(145, 44, 246, 1)',
              'rgba(23, 35, 76, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
            ],

            borderWidth: 1,
          },
        ],
      },
      options: {
        title: {
          display: true,
          text: 'Number of Sentiments Analysed per Source',
          align: 'left',
        },
        responsive: true,
        drawChartArea: false,
        maintainAspectRatio: false,
        interaction: {
          mode: 'nearest',
          intersect: false,
        },
        legend: {
          display: false,
        },
        onClick: (event: any, elements: string | any[]) => {
          if (elements && elements.length > 0) {
            const clickedIndex = elements[0]._index;
            this.showPopup(clickedIndex);
          }
        },
      },
    },
    {
      type: 'pie',
      data: {
        labels: ['Toxic', 'Non-Toxic'],
        datasets: [
          {
            data: [],
            backgroundColor: [
              'rgba(3, 127, 255, 0.8)',
              'rgba(145, 44, 246, 0.8)',
            ],
            borderColor: [
              'rgba(3, 127, 255, 1)',
              'rgba(145, 44, 246, 1)', // Border color for slice 3
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        onClick: (event: any, elements: string | any[]) => {
          if (elements && elements.length > 0) {
            const clickedIndex = elements[0]._index;
            this.showPopup(clickedIndex);
          }
        },
      },
    },
    
  ];
 */

  showPopup(index: number) {
    console.log('Clicked on section:', index);
  }

  constructor(private store: Store) {}

  getColor(value: number): string {
    if (value < 10) {
      return 'rgba(255, 56, 56, 0.8)'; // Dark Red
    } else if (value < 20) {
      return 'rgba(219, 85, 85, 0.8)'; // Red
    } else if (value < 30) {
      return 'rgba(255, 136, 100, 0.8)'; // Red-Orange
    } else if (value < 40) {
      return 'rgba(255, 204, 108, 0.8)'; // Orange
    } else if (value < 50) {
      return 'rgba(255, 232, 101, 0.8)'; // Gold
    } else if (value < 60) {
      return 'rgba(214, 255, 101, 0.8)'; // Light Blue
    } else if (value < 70) {
      return 'rgba(186, 255, 122, 0.8)'; // Green
    } else if (value < 80) {
      return 'rgba(141, 255, 113, 0.8)'; // Lime Green
    } else if (value < 90) {
      return 'rgba(60, 253, 85, 0.8)'; // Cyan
    } else {
      return 'rgba(29, 207, 44, 0.8)'; // Blue
    }
  }
  
  

  ngOnInit(): void {
    this.sourceOverallSentiment.subscribe((data) => {
      console.log(data);
      if (data) {
        if (data.aggregated_metrics.general.category != 'No data') {
          this.updatedGraphArray = this.assignGraphData(
            data.aggregated_metrics,
            data.timeseries,
            this.chartOptionsArray
          );
          setTimeout(() => {
            console.log('rendering graph after fetching data');
            this.renderGraph();
          }, 300);
        }
      }
    });

    this.statisticIndex.subscribe((statIndex) => {
      if (statIndex !== this.currentStatisticIndex && statIndex !== undefined) {
        this.currentStatisticIndex = statIndex;

        this.renderGraph();
      }
    });

    this.chartOptions = this.chartOptionsArray[0];

    this.statisticIndex.subscribe(index => {
      this.updateDots(index);
    });
  }

  private updateDots(selectedIndex: number) {
    // Replace this with logic to get the dots array from your state or data source
    // For now, we'll use a dummy array to represent the dots
    const dotsArray = [2, 2, 3, 2, 1]; // Replace with your data source or state

    // Ensure the selectedIndex is within bounds
    if (selectedIndex >= 0 && selectedIndex < dotsArray.length) {
      this.dots = new Array(dotsArray[selectedIndex]).fill(0);
    } else {
      this.dots = []; // Handle invalid selectedIndex
    }
  }

  public generateData(count: number, yrange: { max: number; min: number }) {
    var i = 0;
    var series = [];
    while (i < count) {
      var x = 'w' + (i + 1).toString();
      var y =
        Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;

      series.push({
        x: x,
        y: y,
      });
      i++;
    }

    console.log(series);
    return series;
  }

  public generateDayWiseTimeSeries = function (
    baseval: number,
    count: number,
    yrange: { min: any; max: any }
  ) {
    var i = 0;
    var series = [];
    while (i < count) {
      var x = baseval;
      var y =
        Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;

      series.push([x, y]);
      baseval += 86400000;
      i++;
    }
    return series;
  };

  ngAfterViewInit() {
    /*    console.log('after view init');
    // Access and manipulate the DOM element in ngAfterViewInit
    setTimeout(() => {
      this.renderGraph();
    }); */
  }

  assignGraphData(
    aggregated_metrics: any,
    timeseries: any,
    graphArray: any[]
  ): any[] {
    const aggregatedMetrics = aggregated_metrics;
    const timeseriesData = timeseries;

    // Update the first graph (doughnut)
    const score = aggregatedMetrics.general.score * 100;
    graphArray[0][0].series = [score];

    // Update the second graph (pie)
    graphArray[1][0].series = [
      Math.floor(aggregatedMetrics.ratios.positive * 100),
      Math.floor(aggregatedMetrics.ratios.negative * 100),
      Math.floor(aggregatedMetrics.ratios.neutral * 100),
    ];

    // Update the third graph (bar)
    graphArray[2][0].series[0].data = [
      Math.floor(aggregatedMetrics.emotions.anger * 100),
      Math.floor(aggregatedMetrics.emotions.disgust * 100),
      Math.floor(aggregatedMetrics.emotions.fear * 100),
      Math.floor(aggregatedMetrics.emotions.joy * 100),
      Math.floor(aggregatedMetrics.emotions.surprise * 100),
      Math.floor(aggregatedMetrics.emotions.sadness * 100),
    ];

    graphArray[2][2].series[0].data = [
      Math.floor(aggregatedMetrics.emotions.anger * 100),
      Math.floor(aggregatedMetrics.emotions.disgust * 100),
      Math.floor(aggregatedMetrics.emotions.fear * 100),
      Math.floor(aggregatedMetrics.emotions.joy * 100),
      Math.floor(aggregatedMetrics.emotions.surprise * 100),
      Math.floor(aggregatedMetrics.emotions.sadness * 100),
    ];

    // Update the fourth graph (pie)
    graphArray[3][0].series = [
      Math.floor(aggregatedMetrics.toxicity.score * 100),
    ];

    console.log('time series');
    console.log(timeseriesData);

    graphArray[0][1].series[0].data = timeseriesData.overall;

    graphArray[1][1].series[0].data = timeseriesData.ratios.pos;
    graphArray[1][1].series[1].data = timeseriesData.ratios.neg;
    graphArray[1][1].series[2].data = timeseriesData.ratios.neu;

    console.log('emotions');
    console.log(timeseriesData.emotions.anger);
    graphArray[2][1].series[0].data = timeseriesData.emotions.anger;
    graphArray[2][1].series[1].data = timeseriesData.emotions.disgust;
    graphArray[2][1].series[2].data = timeseriesData.emotions.fear;
    graphArray[2][1].series[3].data = timeseriesData.emotions.joy;
    graphArray[2][1].series[4].data = timeseriesData.emotions.surprise;
    graphArray[2][1].series[5].data = timeseriesData.emotions.sadness;

    graphArray[3][1].series[0].data = timeseriesData.toxicity.toxic_count;
    graphArray[3][1].series[1].data = timeseriesData.toxicity.overall_helper;


    graphArray[4][0].series[0].data = timeseriesData.num_records;

    return graphArray;
  }

  updatedGraphArray?: any[];

  /* switchToPreviousGraph() {
    if (!this.updatedGraphArray) return;

    console.log('previous graph');
    if (this.currentGraphIndex > 0) {
      this.currentGraphIndex--;
      this.renderGraph();
    } else {
      this.currentGraphIndex = this.updatedGraphArray.length - 1;
      this.renderGraph();
    }
    this.store.dispatch(new ChooseStatistic(this.currentGraphIndex));
  }

  switchToNextGraph() {
    if (!this.updatedGraphArray) return;

    if (this.currentGraphIndex < this.updatedGraphArray.length - 1) {
      this.currentGraphIndex++;
      this.renderGraph();
    } else {
      this.currentGraphIndex = 0;
      this.renderGraph();
    }
    this.store.dispatch(new ChooseStatistic(this.currentGraphIndex));
  } */

  switchToPreviousGraph() {
    if (!this.chartOptionsArray || !this.chartOptionsArray.length) {
      return;
    }

    this.currentGraphIndex =
      (this.currentGraphIndex -
        1 +
        this.chartOptionsArray[this.currentStatisticIndex].length) %
      this.chartOptionsArray[this.currentStatisticIndex].length;

      this.selectedDotIndex = this.currentGraphIndex;

    //this.store.dispatch(new ChooseStatistic(this.currentStatisticIndex));

    this.renderGraph();
  }

  switchToNextGraph() {
    if (!this.chartOptionsArray || !this.chartOptionsArray.length) {
      return;
    }

    this.currentGraphIndex =
      (this.currentGraphIndex + 1) %
      this.chartOptionsArray[this.currentStatisticIndex].length;

    this.selectedDotIndex = this.currentGraphIndex;


    //this.store.dispatch(new ChooseStatistic(this.currentStatisticIndex));

    this.renderGraph();
  }

  renderGraph() {
    console.log(
      'rendering graph at stat index: ' +
        this.currentStatisticIndex +
        ' and graph index: ' +
        this.currentGraphIndex
    );

    /* if (!this.updatedGraphArray || !this.chartOptionsArray[this.currentGraphIndex]) {
      return;
    } */

    /* if (!this.updatedGraphArray || !this.chartOptionsArray[this.currentGraphIndex]) {
      return;
    } */
    

    const container = this.chartContainer.nativeElement;
    const containerHeight = container.offsetHeight;

    if (
      this.currentGraphIndex >
      this.chartOptionsArray[this.currentStatisticIndex].length - 1
    ) {
      this.currentGraphIndex =
        this.chartOptionsArray[this.currentStatisticIndex].length - 1;
        this.selectedDotIndex = this.currentGraphIndex;
    }

    // Update chart height based on container's height
    if (
      this.chartOptionsArray[this.currentStatisticIndex][this.currentGraphIndex]
        .chart?.height
    ) {
      this.chartOptionsArray[this.currentStatisticIndex][
        this.currentGraphIndex
      ].chart.height = containerHeight;
    }

    this.chartOptions =
      this.chartOptionsArray[this.currentStatisticIndex][
        this.currentGraphIndex
      ];

      Chart.defaults['color'] = '#a11111';

    // Render the chart with the updated options
    // Replace 'apexchart' with the appropriate chart component and attributes
    //this.chart.updateOptions(this.chartOptions);

    if (!this.myChart || !this.chartContainer) {
      return;
    }

    /* if (this.chart) {
      this.chart.destroy();
    }
 */
    const element = document.querySelector('body'); // Replace with your actual element selector
    if (element) {
      const styles = window.getComputedStyle(element);
      const backgroundColor = styles.getPropertyValue('--text-color');
      Chart.defaults.global.defaultFontColor = backgroundColor;
    }

    /* const ctx = this.myChart.nativeElement.getContext('2d');

    const container = this.chartContainer.nativeElement;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    this.myChart.nativeElement.width = containerWidth;
    this.myChart.nativeElement.height = containerHeight;

    if (!this.updatedGraphArray || this.updatedGraphArray.length === 0) {
      return;
    }

    this.myChart.nativeElement.setAttribute('data-cy', this.currentGraphIndex);

    const currentGraph = this.updatedGraphArray[this.currentGraphIndex];

    this.chart = new Chart(ctx, currentGraph);
    if (this.chart && this.chart.config.type === 'doughnut') {
      const offset = 30;
      this.myChart.nativeElement.style.transform = `translateY(${offset}px)`;
    } else {
      this.myChart.nativeElement.style.transform = `translateY(0px)`;
    }*/
  }

  getSelectedDots(): number[] {
    const selectedDotsCount = this.dots[this.selectedDotIndex];
    return Array(selectedDotsCount).fill(0);
  }

  selectDot(index: number) {
    this.selectedDotIndex = index;
    this.currentGraphIndex = index;

    this.renderGraph();

  }
}
