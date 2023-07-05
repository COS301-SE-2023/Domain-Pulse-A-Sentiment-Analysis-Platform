import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as Chart from 'chart.js';

@Component({
  selector: 'graph-selector',
  templateUrl: './graph-selector.component.html',
  styleUrls: ['./graph-selector.component.sass'],
})
export class GraphSelectorComponent {
  @ViewChild('myChart') myChart!: ElementRef;
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  mockData =
    {
      "aggregated_metrics": {
        "general": {
          "category": "POSITIVE",
          "score": 0.714
        },
        "emotions": {
          "anger": 0.0231,
          "disgust": 0.012,
          "fear": 0,
          "joy": 0.6777,
          "neutral": 0.0434,
          "sadness": 0.2187,
          "surprise": 0.0251
        },
        "toxicity": {
          "level_of_toxic": "Non-toxic",
          "score": 0.0009
        },
        "ratios": {
          "positive": 0.3031,
          "neutral": 0.6213,
          "negative": 0.0757
        }
      }
    }


  chart: Chart | undefined;
  gradient: CanvasGradient | undefined;
  graphs = [
    {
      type: 'doughnut',
      data: {
        labels: ['Overall Score'],
        datasets: [
          {
            data: [],
            backgroundColor: [
              'rgba(3, 127, 255, 1)',
              'rgba(0, 0, 0, 0.1)',
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
        }
      },
    },
    {
      type: 'bar', 
      data: {
        labels: ["anger",
          "disgust",
          "fear",
          "joy",
          "neutral",
          "sadness",
          "surprise"], 
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
              'rgba(75, 192, 192, 0.8)'
            ], 
            
            borderColor: [
              'rgba(3, 127, 255, 1)',
              'rgba(145, 44, 246, 1)',
              'rgba(23, 35, 76, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)'
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
        }
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
        }
      },
    },
    /* {
      type: 'bar', 
      data: {
        labels: ['Facebook', 'Instagram', 'Reddit'], 
        datasets: [
          {
            label: 'Nr. of Sentiments', 
            data: [23000, 17530, 3450], 
            backgroundColor: [
              'rgba(3, 127, 255, 0.8)',
              'rgba(145, 44, 246, 0.8)',
              'rgba(23, 35, 76, 0.8)',
            ], 
            borderColor: [
              'rgba(3, 127, 255, 1)',
              'rgba(145, 44, 246, 1)',
              'rgba(23, 35, 76, 1)',
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
      },
    } */

    /* Define your different graphs here */
    // { labels: ['Label 1', 'Label 2', 'Label 3'], data: [10, 20, 30], ... },
    // { labels: ['Label A', 'Label B', 'Label C'], data: [50, 40, 30], ... },
    // ...
  ];

  showPopup(index: number) {
    console.log('Clicked on section:', index);
  }

  assignGraphData(mockData: any, graphArray: any[]): any[] {
    const aggregatedMetrics = mockData.aggregated_metrics;

    // Update the first graph (doughnut)
    const score = Math.floor(aggregatedMetrics.general.score * 100) / 2;
    const otherScore = 50 - score;
    graphArray[0].data.datasets[0].data = [score, otherScore, 50];

    // Update the second graph (pie)
    graphArray[1].data.datasets[0].data = [
      Math.floor(aggregatedMetrics.ratios.positive * 100),
      Math.floor(aggregatedMetrics.ratios.negative * 100),
      Math.floor(aggregatedMetrics.ratios.neutral * 100)
    ];

    // Update the third graph (bar)
    graphArray[2].data.datasets[0].data = [
      Math.floor(aggregatedMetrics.emotions.anger * 100),
      Math.floor(aggregatedMetrics.emotions.disgust * 100),
      Math.floor(aggregatedMetrics.emotions.fear * 100),
      Math.floor(aggregatedMetrics.emotions.joy * 100),
      Math.floor(aggregatedMetrics.emotions.neutral * 100),
      Math.floor(aggregatedMetrics.emotions.sadness * 100),
      Math.floor(aggregatedMetrics.emotions.surprise * 100)
    ];

    // Update the fourth graph (pie)
    graphArray[3].data.datasets[0].data = [
      Math.floor(aggregatedMetrics.toxicity.score * 100),
      Math.floor((1 - aggregatedMetrics.toxicity.score) * 100)
    ];

    return graphArray;
  }

  updatedGraphArray = this.assignGraphData(this.mockData, this.graphs);


  currentGraphIndex = 0;

  ngAfterViewInit() {
    this.renderGraph();
  }

  switchToPreviousGraph() {
    console.log('previous graph');
    if (this.currentGraphIndex > 0) {
      this.currentGraphIndex--;
      this.renderGraph();
    } else {
      this.currentGraphIndex = this.updatedGraphArray.length - 1;
      this.renderGraph();
    }
  }

  switchToNextGraph() {
    console.log('next graph');
    if (this.currentGraphIndex < this.updatedGraphArray.length - 1) {
      this.currentGraphIndex++;
      this.renderGraph();
    } else {
      this.currentGraphIndex = 0;
      this.renderGraph();
    }
  }

  renderGraph() {
    if (this.chart) {
      this.chart.destroy();
    }
    const ctx = this.myChart.nativeElement.getContext('2d');
    const container = this.chartContainer.nativeElement;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    this.myChart.nativeElement.width = containerWidth;
    this.myChart.nativeElement.height = containerHeight;

    const currentGraph = this.updatedGraphArray[this.currentGraphIndex];

    this.chart = new Chart(ctx, currentGraph);
    if (this.chart && this.chart.config.type === 'doughnut') {
      const offset = 50;
      this.myChart.nativeElement.style.transform = `translateY(${offset}px)`;
    } else {
      this.myChart.nativeElement.style.transform = `translateY(0px)`;
    }
  }
}
