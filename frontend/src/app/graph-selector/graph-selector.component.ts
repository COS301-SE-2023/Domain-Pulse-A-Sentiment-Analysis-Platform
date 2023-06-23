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
  
  ngAfterViewInit() {
    const ctx = this.myChart.nativeElement.getContext('2d');
    const container = this.chartContainer.nativeElement;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    
    this.myChart.nativeElement.width = containerWidth;
    this.myChart.nativeElement.height = containerHeight;
    
    const chart = new Chart(ctx, {
      type: 'bar', // Replace with your desired chart type (e.g., line, pie, etc.)
      data: {
        labels: ['Label 1', 'Label 2', 'Label 3'], // Replace with your data labels
        datasets: [{
          label: 'Dataset 1', // Replace with your dataset label
          data: [10, 20, 30], // Replace with your dataset values
          backgroundColor: 'rgba(75, 192, 192, 0.6)', // Replace with desired colors
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        // Replace with your desired chart options (e.g., title, scales, etc.)
      }
    });
  }
  

}
