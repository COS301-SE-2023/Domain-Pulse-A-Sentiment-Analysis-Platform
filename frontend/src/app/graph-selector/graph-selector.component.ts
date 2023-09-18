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
                formatter: function (val: any) {
                  return parseInt(val.toFixed(2)) + '%';
                },
              },
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
              formatter: function (val: any) {
                return val.toFixed(0);
              },
            },
          },
        ],
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
              formatter: function (val: any) {
                return val.toFixed(0);
              },
            },
          },
        ],
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
              formatter: function (val: any) {
                return val.toFixed(0);
              },
            },
          },
        ],
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
              formatter: function (val: any) {
                return val.toFixed(0);
              },
            },
          },
        ],
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
            formatter: function (val: any) {
              return val.toFixed(0);
            },
          },
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
                formatter: function (val: any) {
                  return parseInt(val.toFixed(2)) + '%';
                },
              },
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
              formatter: function (val: any) {
                return val.toFixed(0);
              },
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
              formatter: function (val: any) {
                return val.toFixed(0);
              },
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

  constructor(private store: Store) {}

  /* ngOnInit(): void {
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
      this.processStatisticIndex(statIndex);
    });

    this.chartOptions = this.chartOptionsArray[0];

    this.statisticIndex.subscribe(index => {
    });
  } */

  ngOnInit(): void {
    this.sourceOverallSentiment.subscribe((data) => {
      this.processOverallSentiment(data);
    });

    this.statisticIndex.subscribe((statIndex) => {
      this.processStatisticIndex(statIndex);
    });

    this.chartOptions = this.chartOptionsArray[0];

    this.statisticIndex.subscribe((index) => {
      this.processStatisticIndex2(index);
    });
  }

  public processOverallSentiment(data: any) {
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
  }

  public processStatisticIndex(statIndex: number) {
    if (statIndex !== this.currentStatisticIndex && statIndex !== undefined) {
      this.currentStatisticIndex = statIndex;
      this.renderGraph();
    }
  }

  public processStatisticIndex2(statIndex: number) {

    this.updateDots(statIndex);

  }

  /* ngOnInit(): void {
    this.sourceOverallSentiment.subscribe((data) => {
      processOverallSetniment(data);
    });

    this.statisticIndex.subscribe((statIndex) => {
      .. put it in a function
    });

    this.chartOptions = this.chartOptionsArray[0];

    this.statisticIndex.subscribe(index => {
      ...put it in a function
    });
  }

processOverallSetniment(data) {
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
} */

  public updateDots(selectedIndex: number) {
    if (selectedIndex < 0) {
      this.dots = [];
    }

    const dotsArray = [2, 2, 3, 2, 1];

    if (selectedIndex >= 0 && selectedIndex < dotsArray.length) {
      this.dots = new Array(dotsArray[selectedIndex]).fill(0);
    } else {
      this.dots = [];
    }
  }

  assignGraphData(
    aggregated_metrics: any,
    timeseries: any,
    graphArray: any[]
  ): any[] {
    const aggregatedMetrics = aggregated_metrics;
    const timeseriesData = timeseries;

    console.log('timeseries data');
    console.log(timeseriesData);

    console.log('aggregated metrics');
    console.log(aggregatedMetrics);

    console.log('graph array');
    console.log(graphArray);

    const score = aggregatedMetrics.general.score * 100;
    graphArray[0][0].series = [score];

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

    graphArray[3][0].series = [
      Math.floor(aggregatedMetrics.toxicity.score * 100),
    ];

    graphArray[0][1].series[0].data = timeseriesData.overall;

    graphArray[1][1].series[0].data = timeseriesData.ratios.pos;
    graphArray[1][1].series[1].data = timeseriesData.ratios.neg;
    graphArray[1][1].series[2].data = timeseriesData.ratios.neu;

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

    this.renderGraph();
  }

  renderGraph() {
    console.log(
      'rendering graph at stat index: ' +
        this.currentStatisticIndex +
        ' and graph index: ' +
        this.currentGraphIndex
    );

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
  }

  getSelectedDots(): number[] {
    const selectedDotsCount = this.dots[this.selectedDotIndex];
    return Array(selectedDotsCount).fill(0);
  }

  selectDot(index: number) {
    if (index >= this.dots.length || index < 0) {
      return;
    }

    this.selectedDotIndex = index;
    this.currentGraphIndex = index;

    this.renderGraph();
  }
}
