import { Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import * as Chart from 'chart.js';


@Component({
  selector: 'graph-selector',
  templateUrl: './graph-selector.component.html',
  styleUrls: ['./graph-selector.component.sass']
})
export class GraphSelectorComponent {
  @ViewChild('myChart') myChart!: ElementRef;
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  
  
  chart: Chart | undefined;
  gradient: CanvasGradient | undefined;
  graphs = [
  {
    "type": "doughnut",
    "data": {
      "labels": ["Overall Score"],
      "datasets": [
        {
          "data": [30, 20, 50],
          "backgroundColor": ["rgba(3, 127, 255, 1)", "rgba(0, 0, 0, 0.1)", "rgba(0, 0, 0, 0)"],
          "borderWidth": 0
        }
      ]
    },
    "options": {
      "responsive": true,
      "maintainAspectRatio": false,
      "cutout": "50%", // Adjust the cutout percentage to control the size of the gauge
      "rotation": 1 * Math.PI, // Adjust the rotation angle to position the gauge needle
      "tooltips": {
        "enabled": false // Disable tooltips to prevent them from appearing on hover
      },
      "plugins": {
        "legend": {
          "display": false // Disable legend display
        }
      }
    }
  },
  {
    type: 'pie',
    data: {
      labels: ['Positive', 'Negative', 'Neutral'], // Replace with your data labels
      datasets: [{
        data: [30, 20, 50], // Replace with your data values
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)', // Color for slice 1
          'rgba(255, 99, 132, 0.8)', // Color for slice 2
          'rgba(54, 162, 235, 0.8)'  // Color for slice 3
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)', // Border color for slice 1
          'rgba(255, 99, 132, 1)', // Border color for slice 2
          'rgba(54, 162, 235, 1)'  // Border color for slice 3
        ],
        borderWidth: 1
      }]
    },
    options: {
      // Additional options for your chart
    }
  },
  {
    type: 'pie',
    data: {
      labels: ['Objectivity', 'Subjectivity'], // Replace with your data labels
      datasets: [{
        data: [12, 87], // Replace with your data values
        backgroundColor: [
          'rgba(3, 127, 255, 0.8)',
          'rgba(145, 44, 246, 0.8)'
        ],
        borderColor: [
          'rgba(3, 127, 255, 1)',
          'rgba(145, 44, 246, 1)'  // Border color for slice 3
        ],
        borderWidth: 1
      }]
    },
    options: {
      // Additional options for your chart
    }
  },
  {
    type: 'bar', // Replace with your desired chart type (e.g., line, pie, etc.)
    data: {
      labels: ['Facebook', 'Instagram', 'Reddit'], // Replace with your data labels
      datasets: [{
        label: 'Nr. of Sentiments', // Replace with your dataset label
        data: [23000, 17530, 3450], // Replace with your dataset values
        backgroundColor: ['rgba(3, 127, 255, 0.8)', 'rgba(145, 44, 246, 0.8)', 'rgba(23, 35, 76, 0.8)' ], // Replace with desired colors
        borderColor: ['rgba(3, 127, 255, 1)', 'rgba(145, 44, 246, 1)', 'rgba(23, 35, 76, 1)'],
        borderWidth: 1
      }]
    },
    options: {        
      title: {
          display: true,
          text: 'Number of Sentiments Analysed per Source',
          align: 'left'
       
      },
      responsive: true,
      drawChartArea: false,
      maintainAspectRatio: false,
      interaction: {
        mode: 'nearest', // Set the interaction mode to 'nearest' to prevent hover events
        intersect: false, // Disable event interactions with elements
      },
      legend: {
       display: false 
      }
  }
  }
  
  
  


    /* Define your different graphs here */
    // { labels: ['Label 1', 'Label 2', 'Label 3'], data: [10, 20, 30], ... },
    // { labels: ['Label A', 'Label B', 'Label C'], data: [50, 40, 30], ... },
    // ...
  ];
  
  currentGraphIndex = 0;
  
  ngAfterViewInit() {
    
    this.renderGraph();
  }
  
  switchToPreviousGraph() {
    console.log("previous graph");
    if (this.currentGraphIndex > 0) {
      this.currentGraphIndex--;
      this.renderGraph();
    }
    else{
      this.currentGraphIndex = this.graphs.length - 1;
      this.renderGraph();
    }
  }
  
  switchToNextGraph() {
    console.log("next graph");
    if (this.currentGraphIndex < this.graphs.length - 1) {
      this.currentGraphIndex++;
      this.renderGraph();
    }
    else{
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
    
    const currentGraph = this.graphs[this.currentGraphIndex];

    this.chart = new Chart(ctx, currentGraph);
    if (this.chart && this.chart.config.type === 'doughnut') {
      
      const offset = 50;
      this.myChart.nativeElement.style.transform = `translateY(${offset}px)`;
    }else{
      this.myChart.nativeElement.style.transform = `translateY(0px)`;
    }
  }
  

}
