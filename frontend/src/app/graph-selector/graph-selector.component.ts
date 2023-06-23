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
  graphs = [
    {
      type: 'bar', // Replace with your desired chart type (e.g., line, pie, etc.)
      data: {
        labels: ['Label 1', 'Label 2', 'Label 3'], // Replace with your data labels
        datasets: [{
          label: 'Dataset 1', // Replace with your dataset label
          data: [10, 20, 30], // Replace with your dataset values
          backgroundColor: 'rgba(190, 192, 192, 0.6)', // Replace with desired colors
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'nearest', // Set the interaction mode to 'nearest' to prevent hover events
          intersect: false, // Disable event interactions with elements
        }
        
    }
    },
    {
      type: 'bar', // Replace with your desired chart type (e.g., line, pie, etc.)
      data: {
        labels: ['Label 1', 'Label 2', 'Label 3'], // Replace with your data labels
        datasets: [{
          label: 'Dataset 1', // Replace with your dataset label
          data: [30, 5, 20], // Replace with your dataset values
          backgroundColor: 'rgba(75, 192, 192, 0.6)', // Replace with desired colors
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'nearest', // Set the interaction mode to 'nearest' to prevent hover events
          intersect: false, // Disable event interactions with elements
        }
        
    }
  },
  {
    "type": "doughnut",
    "data": {
      "labels": ["Label"],
      "datasets": [
        {
          "data": [30, 20, 50],
          "backgroundColor": ["rgba(75, 192, 192, 0.6)", "rgba(0, 0, 0, 0.1)", "rgba(0, 0, 0, 0)"],
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
    // Use currentGraph to render the chart
    // ...
    this.chart = new Chart(ctx, currentGraph);
    if (this.chart && this.chart.config.type === 'doughnut') {
      const chartContainerHeight = this.chartContainer.nativeElement.offsetHeight;
      const offset = chartContainerHeight / 4;
      this.myChart.nativeElement.style.transform = `translateY(${offset}px)`;
    }else{
      this.myChart.nativeElement.style.transform = `translateY(0px)`;
    }
  }
  

}
